---
title: "Hypervisors, KVM & QEMU: A Complete Guide to Virtual Machines on Ubuntu 24.04 LTS"
date: 2025-03-10
tags: ["KVM", "QEMU", "Virtualization", "Linux", "Windows 11", "Kali Linux", "Parrot OS", "virt-manager", "Hypervisors"]
summary: "A deep-dive guide from theory to practice — setting up virt-manager on Ubuntu 24.04 LTS, installing Windows 11, Kali Linux, and Parrot OS as virtual machines, passing GPU drivers, defeating Secure Boot, and fixing every error along the way."
author: "Muhammad Awais"
---

> **A note from me:** I have been running KVM/QEMU on my Ubuntu machine for 4–5 months. Most guides I found were incomplete, outdated, or skipped the hard parts — like where to actually find the latest VirtIO drivers, or what to do when Windows 11 refuses to install because of Secure Boot. This guide covers all of it. Everything here is from real experience.

---

## Part I — Theory: Understanding Virtualization & Hypervisors

Before touching the terminal, you need to understand what you are actually building. Skipping theory is why most people get confused when things break.

### What Is a Hypervisor?

A **hypervisor** is software that creates and manages virtual machines (VMs). It sits between the physical hardware and the guest operating systems, dividing hardware resources — CPU cores, RAM, storage, network — among multiple isolated environments simultaneously.

Think of it this way: your physical machine is a building. The hypervisor is the landlord. Each VM is a tenant with its own locked apartment — they share the same building infrastructure (power, plumbing) but cannot access each other's space.

### Type 1 vs Type 2 Hypervisors

There are two architectural categories:

**Type 1 — Bare Metal Hypervisors**
These run directly on the hardware, with no host OS underneath. They are faster, more efficient, and used in production servers and cloud infrastructure.

Examples: VMware ESXi, Microsoft Hyper-V (server), Xen, KVM (technically hybrid).

**Type 2 — Hosted Hypervisors**
These run as an application on top of an existing host operating system. Easier to set up, slightly more overhead, perfect for desktop use.

Examples: VirtualBox, VMware Workstation, QEMU (without KVM).

### Where Does KVM Fit?

**KVM (Kernel-based Virtual Machine)** is a Linux kernel module that turns the Linux kernel itself into a Type 1 hypervisor. Once KVM is loaded, the Linux kernel can manage guest VMs with near-native CPU performance by running them in hardware-accelerated isolated mode.

KVM is not a full virtualization stack on its own — it is a kernel module that exposes hardware virtualization extensions (Intel VT-x or AMD-V) to userspace.

### What Is QEMU?

**QEMU (Quick Emulator)** is a full machine emulator and virtualizer. On its own, QEMU emulates an entire CPU in software — accurate but slow. When paired with KVM, QEMU hands off CPU execution to the real hardware via KVM and only handles device emulation (disk controllers, network cards, USB, display output).

The combination **KVM + QEMU** gives you:
- Near-native CPU speed (via hardware virtualization)
- Full device emulation (disks, NICs, USB, GPU passthrough)
- Support for any guest OS that runs on x86_64

### What Is libvirt?

**libvirt** is a management API and daemon that sits on top of QEMU/KVM. Instead of writing long QEMU command-line flags every time, libvirt lets you define VMs as XML configurations and manage them through a stable API.

`virt-manager` is the graphical front-end for libvirt. It gives you a GUI to create, configure, start, stop, snapshot, and clone VMs without touching the terminal.

### What Is VirtIO?

**VirtIO** is a paravirtualization standard. Instead of emulating slow, legacy hardware (like an old IDE disk controller), VirtIO presents the guest OS with a purpose-built virtual device that communicates directly with the hypervisor through an efficient shared-memory channel.

VirtIO drivers make your VM's storage, network, memory ballooning, and display dramatically faster. On Linux guests they are built into the kernel. On Windows guests, you must install them manually — which is why the VirtIO driver ISO exists.

**Without VirtIO drivers on a Windows VM:**
- Disk I/O is 3–10x slower
- Network may not work at all
- Display is limited to VGA (800×600)

### What Is Secure Boot?

**Secure Boot** is a UEFI firmware feature that verifies the cryptographic signature of every bootloader and kernel before executing it. Its purpose is to prevent malicious software from loading before the OS.

The problem in a VM context: when you install custom or unsigned drivers (like NVIDIA drivers transferred from the host), Secure Boot may reject them. This is a real obstruction. I ran into this myself during my Windows 11 VM setup, and the solution I found is documented in detail in the Windows 11 section below.

---

## Part II — Setting Up the Host (Ubuntu 24.04 LTS)

### Step 1: Verify Hardware Virtualization Support

Before installing anything, confirm your CPU supports hardware virtualization:

```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
```

Any number greater than `0` means you are good. `vmx` = Intel VT-x, `svm` = AMD-V.

Also check that virtualization is **enabled in BIOS/UEFI**. If the above returns `0`, reboot into BIOS, find the CPU configuration section, and enable "Intel Virtualization Technology" or "AMD-V / SVM Mode".

### Step 2: Install KVM, QEMU, libvirt and virt-manager

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y \
  qemu-kvm \
  libvirt-daemon-system \
  libvirt-clients \
  bridge-utils \
  virt-manager \
  ovmf \
  virtinst \
  cpu-checker
```

**What each package does:**
- `qemu-kvm` — the QEMU hypervisor with KVM acceleration
- `libvirt-daemon-system` — the libvirt daemon (runs as a background service)
- `libvirt-clients` — command-line tools (`virsh`)
- `bridge-utils` — network bridge utilities for VM networking
- `virt-manager` — the graphical VM manager
- `ovmf` — UEFI firmware for VMs (required for Windows 11 and Secure Boot)
- `virtinst` — `virt-install` CLI tool
- `cpu-checker` — includes `kvm-ok` diagnostic tool

### Step 3: Verify KVM is Working

```bash
kvm-ok
```

Expected output:
```
INFO: /dev/kvm exists
KVM acceleration can be used
```

If you see an error here, go back and enable virtualization in BIOS.

### Step 4: Add Your User to Required Groups

```bash
sudo usermod -aG libvirt $USER
sudo usermod -aG kvm $USER
```

**Log out and log back in** for group membership to take effect. Without this, virt-manager will fail to connect to the hypervisor daemon or will require `sudo` every time.

Verify:
```bash
groups $USER
```

You should see `libvirt` and `kvm` in the output.

### Step 5: Enable and Start libvirt

```bash
sudo systemctl enable --now libvirtd
sudo systemctl status libvirtd
```

The status should show `active (running)`.

### Step 6: Set Up the Default Network

libvirt creates a default NAT network (`virbr0`) for VMs. Enable it:

```bash
sudo virsh net-start default
sudo virsh net-autostart default
```

Verify:
```bash
virsh net-list --all
```

You should see `default` with state `active` and autostart `yes`.

### Step 7: Launch virt-manager

```bash
virt-manager
```

Or find it in your application menu under "Virtual Machine Manager". You should see the QEMU/KVM connection listed. If it shows disconnected, double-click it to connect.

---

## Part III — Kali Linux VM (Primary Walkthrough)

We will install Kali Linux first because it is the simplest case — no Secure Boot complications, VirtIO works out of the box, and it is a good way to get familiar with the virt-manager workflow before tackling Windows 11.

### Download Kali Linux ISO

**Official site:** [https://www.kali.org/get-kali/#kali-installer-images](https://www.kali.org/get-kali/#kali-installer-images)

**Direct download (Installer, 64-bit):**
```
https://cdimage.kali.org/current/kali-linux-2024.4-installer-amd64.iso
```

Choose the **Installer** image (not Live) for a proper installation. Verify the SHA256 checksum from the official site after downloading.

### Creating the Kali Linux VM

**1. Open virt-manager** → Click "Create a new virtual machine" (the monitor icon with a plus sign).

**2. Choose installation media:** Select "Local install media (ISO image or CDROM)" → Forward.

**3. Browse to your ISO:** Click "Browse" → "Browse Local" → navigate to your downloaded Kali ISO. virt-manager should auto-detect it as "Debian" — that is correct, Kali is Debian-based.

**4. Set RAM and CPU:**
- RAM: minimum 2048 MB, recommended **4096 MB**
- CPUs: minimum 2, recommended **4**

**5. Set disk size:** 40 GB minimum, **60 GB recommended**. Leave "Enable storage for this virtual machine" checked. The default qcow2 format is correct — it is thin-provisioned (only uses actual space, not the full 60 GB upfront).

**6. Name and final review:** Name it `kali-linux`. Before clicking Finish, **check "Customize configuration before install"**.

### Critical Configuration Before Starting

In the customization screen:

**Overview tab:**
- Firmware: `BIOS` (Kali does not need UEFI, simpler is better here)
- Chipset: `Q35` (modern PCIe chipset, better performance)

**CPUs tab:**
- Check "Copy host CPU configuration" — this passes through your real CPU flags, giving better performance and enabling features the guest can use.

**Disk (VirtIO Disk 1):**
- Disk bus: change from `IDE` or `SATA` to **`VirtIO`**
- Cache mode: `writeback` (faster, safe for a VM)

**NIC:**
- Device model: change to **`virtio`**

**Display:**
- Type: `Spice` (better than VNC for Linux guests — clipboard sharing, better resolution)
- Video model: `virtio` (QXL also works, but VirtIO is preferred on Ubuntu host)

Click **"Begin Installation"**.

### Installing Kali Linux

The standard Debian installer will load. Follow these steps:

1. Select **"Graphical Install"**
2. Choose language, location, keyboard layout
3. Set hostname (e.g. `kali-vm`), leave domain blank
4. Set root password and create a user account
5. **Partition disks:** Choose "Guided — use entire disk" → select the VirtIO disk (it will appear as `/dev/vda`) → "All files in one partition" → Finish and confirm write to disk
6. Wait for base system installation
7. **Software selection:** Keep "Kali desktop environment" and "standard system utilities" checked. Add any additional tools you want.
8. Install GRUB to `/dev/vda`
9. Complete installation → reboot

### Post-Install: Guest Tools

After booting into Kali, install QEMU guest agent for better integration:

```bash
sudo apt update
sudo apt install -y qemu-guest-agent spice-vdagent
sudo systemctl enable --now qemu-guest-agent
```

`spice-vdagent` enables clipboard sharing between host and guest and dynamic display resolution when you resize the window.

### Common Kali VM Errors

**"No bootable device" after install:**
The GRUB bootloader may have been installed to the wrong location. Go to VM settings → Boot Options → ensure the VirtIO disk is at the top of the boot order.

**Display stuck at low resolution:**
Install `spice-vdagent` (shown above) and log out/in. If using VNC instead of SPICE, switch to SPICE in VM settings for a better experience.

**Slow disk I/O:**
Ensure the disk bus is set to VirtIO, not IDE or SATA. You can change this in VM settings → storage even after installation, but you may need to reinstall if the kernel module is missing.

**Network not detected:**
Ensure NIC model is set to `virtio`. Check with `ip a` inside the guest — look for `enp1s0` or similar. If missing, run `sudo dhclient enp1s0`.

---

## Part IV — Windows 11 VM (Advanced)

Windows 11 is the most complex guest to set up in KVM. It requires UEFI, TPM emulation, and VirtIO drivers loaded during installation. This section documents every step in detail, including the Secure Boot + NVIDIA driver problem I personally solved.

### Required Files

You need two ISOs. I am providing direct links because finding the correct VirtIO ISO — especially a recent version — is genuinely difficult and I wasted hours on it.

**Windows 11 ISO:**
- Official download page: [https://www.microsoft.com/software-download/windows11](https://www.microsoft.com/software-download/windows11)
- Choose "Download Windows 11 Disk Image (ISO) for x64 devices"
- Select language → generate download link (valid 24 hours)

**VirtIO Drivers ISO** (critical for Windows on KVM):
- Official Fedora project page: [https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/)
- **Direct download link:**
```
https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso
```

> I am sharing this direct link specifically because when I was setting up my Windows 11 VM, I spent a frustrating amount of time trying to find the latest stable VirtIO ISO. The Fedora project hosts it but the path is not obvious from search results. Bookmark that URL.

### Creating the Windows 11 VM

**1. New VM** → "Local install media" → browse to your Windows 11 ISO. virt-manager may not auto-detect it — manually select "Microsoft Windows 11" or "Windows 11" if available, otherwise "Generic" is fine.

**2. RAM and CPU:**
- RAM: **8192 MB minimum** (Windows 11 is memory-hungry)
- CPUs: **4 minimum**, 8 recommended

**3. Disk:** 80 GB minimum, **120 GB recommended**.

**4. Name:** `windows-11` — check "Customize configuration before install".

### Windows 11 VM Configuration (Critical)

**Overview:**
- Firmware: **`UEFI x86_64: /usr/share/OVMF/OVMF_CODE_4M.secboot.fd`** — This is the Secure Boot capable UEFI firmware. Windows 11 requires UEFI.
- Chipset: `Q35`

**CPUs:**
- Check "Copy host CPU configuration"
- Under Topology, manually set: Sockets=1, Cores=4, Threads=2 (adjust to your hardware)

**Add TPM (required for Windows 11):**
Click "Add Hardware" → TPM → Model: `TIS`, Version: `2.0`, Backend: `Emulated`. Windows 11 checks for TPM 2.0 at install time and will refuse to proceed without it.

**Disk:**
- Bus: **VirtIO**
- Cache: `writeback`

**Add second CDROM for VirtIO drivers:**
Click "Add Hardware" → Storage → Device type: `CDROM device` → browse to your `virtio-win.iso`. This second CDROM is how Windows will see the VirtIO drivers during installation.

**NIC:** Model: `virtio`

**Video:** Model: `virtio` or `QXL`

### Installing Windows 11

1. Start the VM. Press any key to boot from DVD when prompted (you have only a few seconds).

2. Select language, time, keyboard → "Install now".

3. **"Where do you want to install Windows?"** — You will see **no disks**. This is expected. The VirtIO disk controller requires a driver that Windows does not have by default.

   Click **"Load driver"** → Browse → navigate to the VirtIO CDROM → `viostor` → `w11` → `amd64` → OK. Select "Red Hat VirtIO SCSI controller" → Next.

   The disk will now appear. Select it → Next.

4. Let installation proceed. Windows will reboot several times — the VM will automatically boot from disk after the first reboot (not the ISO again).

5. Go through OOBE (Out of Box Experience): region, keyboard, network. 

   **Tip for skipping Microsoft account:** At the network screen, if you want a local account only, press `Shift + F10` to open Command Prompt, type `OOBE\BYPASSNRO` and press Enter. The VM will reboot and give you a "I don't have internet" option.

6. Complete setup → boot into desktop.

### Installing VirtIO Drivers in Windows

Once at the Windows desktop, open File Explorer → navigate to the VirtIO CDROM drive.

Run `virtio-win-gt-x64.msi` — this installs all VirtIO drivers at once:
- VirtIO SCSI (disk performance)
- VirtIO Network (network)
- VirtIO Balloon (memory management)
- VirtIO Serial
- VirtIO RNG (random number generator)
- QXL display driver (if using QXL video)

After installation, run `virtio-win-guest-tools.exe` for the guest agent.

Reboot the VM. You should now have full network access and much better disk performance.

### The Secure Boot + NVIDIA Driver Problem (Real Experience)

After getting Windows 11 running, I wanted to pass my NVIDIA GPU drivers from the Ubuntu host into the Windows VM — not full GPU passthrough, but simply getting the drivers installed so the guest had proper GPU support.

The problem: **Windows 11 requires Secure Boot to be enabled**. With Secure Boot on, unsigned or externally-sourced drivers are rejected. NVIDIA drivers transferred from Linux are not signed with a key that Windows trusts in this context.

Disabling Secure Boot in the VM firmware settings would cause Windows 11 to detect the change and either refuse to boot or enter a recovery loop — because Windows 11 validates the Secure Boot state at boot time.

**The solution I found:**

Windows stores Secure Boot state in a specific registry location and in the NVRAM variables. There is a way to make Windows *believe* Secure Boot is enabled while the firmware has it disabled.

Inside the Windows VM, open Command Prompt as Administrator and run:

```cmd
bcdedit /set {current} nointegritychecks on
bcdedit /set {current} testsigning on
```

Then, in the VM firmware (OVMF), disable Secure Boot:
1. Shut down the VM
2. In virt-manager → VM details → Overview → change firmware to the non-secboot OVMF variant: `/usr/share/OVMF/OVMF_CODE_4M.fd`
3. Start the VM

With `testsigning` mode on and Secure Boot disabled in firmware, Windows boots and accepts unsigned drivers. Transfer your NVIDIA drivers and install them normally.

**The registry approach (deeper fix):**

If the above is not enough and Windows is checking the UEFI Secure Boot variable directly:

1. Open `regedit` as Administrator
2. Navigate to:
   ```
   HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecureBoot\State
   ```
3. The value `UEFISecureBootEnabled` will be `0` (off). You can set it to `1` to make software checks believe Secure Boot is on, while the firmware has it off.

> **Important:** This is not a security bypass for production use — this is a VM environment where you control both host and guest. This technique is specifically for getting drivers installed that would otherwise be blocked. I used this exact approach to successfully transfer and install NVIDIA drivers into my Windows 11 VM.

After driver installation, you can reverse the `bcdedit` flags:
```cmd
bcdedit /set {current} nointegritychecks off
bcdedit /set {current} testsigning off
```

And switch the firmware back to the Secure Boot version if desired.

### Common Windows 11 VM Errors

**"This PC doesn't meet Windows 11 requirements":**
You are missing TPM 2.0 emulation or UEFI firmware. Ensure you added the emulated TPM hardware and selected the OVMF secboot firmware (see configuration section above).

**Disk not detected during installation:**
You need to load the VirtIO SCSI driver. Click "Load driver" and browse to `viostor/w11/amd64` on the VirtIO ISO (see installation section above).

**Network not working after install:**
Run the `virtio-win-gt-x64.msi` installer from the VirtIO CDROM. This installs the NetKVM (network) driver.

**Black screen after OOBE:**
This often happens with QXL video. Switch video model to `virtio` in VM settings, or add a `VGA` device as a fallback.

**Windows activation issues:**
These are unrelated to virtualization. Use your existing license key or use Windows in evaluation mode for testing.

**Very slow performance:**
Ensure VirtIO disk and network drivers are installed. Check that "Copy host CPU configuration" is enabled. In Task Manager, if CPU is at 100% constantly, increase vCPU count.

**BSOD with DRIVER_IRQL_NOT_LESS_OR_EQUAL:**
Often caused by a driver conflict during VirtIO installation. Boot into Safe Mode (hold Shift during restart → Troubleshoot → Advanced → Startup Settings → Safe Mode) and reinstall VirtIO drivers.

---

## Part V — Parrot OS VM

Parrot OS is similar to Kali in that it is Debian-based and Linux guests are straightforward. The main difference is the available editions — use Security or Home depending on your use case.

### Download Parrot OS ISO

**Official site:** [https://www.parrotsec.org/download/](https://www.parrotsec.org/download/)

**Direct download links:**

Security Edition (penetration testing tools included):
```
https://deb.parrot.sh/parrot/iso/6.1/Parrot-security-6.1_amd64.iso
```

Home Edition (lighter, no security tools pre-installed):
```
https://deb.parrot.sh/parrot/iso/6.1/Parrot-home-6.1_amd64.iso
```

> Check [https://www.parrotsec.org/download/](https://www.parrotsec.org/download/) for the latest version number and update the URL accordingly. Version 6.x is current as of early 2025.

### Creating the Parrot OS VM

Follow the same steps as Kali Linux with these specifications:

**VM Configuration:**
- Firmware: `BIOS` (Parrot supports UEFI but BIOS is simpler)
- Chipset: `Q35`
- RAM: **4096 MB** minimum, 8192 recommended
- CPUs: 2 minimum, 4 recommended  
- Disk: **50 GB**, VirtIO bus
- NIC: VirtIO
- Display: SPICE
- Video: VirtIO

### Installing Parrot OS

1. Boot from ISO → select **"Install"** or **"Graphical Install"**
2. Follow the Calamares installer (Parrot uses Calamares, not the Debian installer)
3. **Partition:** Select "Erase disk" → the VirtIO disk will appear as `/dev/vda` → proceed
4. Create user account → set timezone
5. Complete installation → reboot

### Post-Install Guest Tools

```bash
sudo apt update
sudo apt install -y qemu-guest-agent spice-vdagent
sudo systemctl enable --now qemu-guest-agent
```

### Common Parrot OS VM Errors

**Calamares installer crashes:**
Increase RAM to at least 4 GB. The live environment + installer combined can exceed 2 GB.

**Boot loops after installation:**
In VM boot options, ensure the VirtIO disk is first in boot order (above the CDROM).

**MATE/KDE desktop not rendering properly:**
Set video to `virtio` and install `spice-vdagent`. Log out and back in to allow dynamic resolution.

**Keyboard/mouse not captured properly:**
Click inside the VM window once to capture input. Press `Ctrl+Alt` to release. For SPICE, install `spice-vdagent` which handles this automatically.

---

## Part VI — VM Management & Useful Tips

### Snapshots

Snapshots save the VM state at a point in time — invaluable before risky operations like installing new drivers.

```bash
# Create snapshot via virsh
virsh snapshot-create-as windows-11 "before-nvidia-drivers" "Before NVIDIA driver install"

# List snapshots
virsh snapshot-list windows-11

# Revert to snapshot
virsh snapshot-revert windows-11 "before-nvidia-drivers"
```

Or use virt-manager: VM details → Snapshots tab (camera icon) → click the + button.

### Cloning VMs

```bash
virt-clone --original kali-linux --name kali-linux-backup --auto-clone
```

### Shared Folders (Host ↔ Guest)

For Linux guests, use VirtIO-FS or a simple SSH connection.

For Windows guests, the easiest method is to enable the SPICE WebDAV channel:
1. In VM settings → Add Hardware → Channel → `org.spice-space.webdav.0`
2. Inside Windows, install "Spice WebDAV daemon" from the VirtIO tools package
3. A shared folder will appear mapped as a network drive

### VM Autostart

```bash
virsh autostart windows-11
```

The VM will start automatically when the host boots.

### Resizing a VM Disk

```bash
# Shut down the VM first, then:
qemu-img resize /var/lib/libvirt/images/windows-11.qcow2 +40G
```

Then expand the partition inside the guest (Disk Management on Windows, `gparted` or `parted` on Linux).

### Checking VM Resource Usage

```bash
# CPU and memory stats
virsh domstats windows-11

# Block device stats  
virsh domblkstat windows-11 vda
```

---

## Quick Reference: ISO & Driver Download Links

All files listed here are publicly available from their official sources. I am collecting them in one place because finding the right files — especially recent VirtIO drivers — cost me significant time.

| File | Source | Direct Link |
|------|--------|-------------|
| Kali Linux 2024.4 Installer | kali.org | `https://cdimage.kali.org/current/kali-linux-2024.4-installer-amd64.iso` |
| Windows 11 ISO | microsoft.com | Generate at microsoft.com/software-download/windows11 |
| VirtIO Drivers ISO (stable) | fedorapeople.org | `https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso` |
| Parrot Security 6.1 | parrotsec.org | `https://deb.parrot.sh/parrot/iso/6.1/Parrot-security-6.1_amd64.iso` |
| Parrot Home 6.1 | parrotsec.org | `https://deb.parrot.sh/parrot/iso/6.1/Parrot-home-6.1_amd64.iso` |

> **Note from Muhammad Awais:** I specifically decided to include these direct links in this guide because when I was setting up my own VMs — especially finding the latest VirtIO ISO — it was frustratingly hard to locate. The Fedora project hosts the VirtIO drivers but the path is buried. If these links go stale, the parent directories are `cdimage.kali.org/current/`, `fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/`, and `deb.parrot.sh/parrot/iso/`.

---

## Summary

| OS | Firmware | TPM | Disk Bus | NIC | Complexity |
|----|----------|-----|----------|-----|------------|
| Kali Linux | BIOS | No | VirtIO | VirtIO | Low |
| Parrot OS | BIOS | No | VirtIO | VirtIO | Low |
| Windows 11 | UEFI (OVMF secboot) | Yes (emulated 2.0) | VirtIO + driver load | VirtIO | High |

If you follow this guide and still run into a problem not covered here, the best resources are the [libvirt mailing list](https://listman.redhat.com/mailman/listinfo/libvirt-users), the [QEMU documentation](https://www.qemu.org/docs/master/), and the Kali/Parrot community forums. For Windows-specific VM issues, the [r/VFIO subreddit](https://www.reddit.com/r/VFIO/) is an excellent resource even if you are not doing full GPU passthrough.

Good luck — and once you have KVM running, you will wonder how you ever worked without it.
