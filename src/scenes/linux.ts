import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { container, group, wgrid, type NodeSeed, type WeightedSeed, type WeightedSpec } from '../engine/patterns.ts'
import { BLUE, GRAY, GREEN, ORANGE, PURPLE, RED, TEAL, YELLOW } from '../engine/colors.ts'

// The WHOLE Linux system on one 16:9 map — the mental model every linux-ct module
// rides (the camera frames one band/subsystem per section via the manifest
// `highlight`/`focus`). Five stacked bands, top→bottom:
//   Userspace (ring 3) → C Library → Syscall Boundary → Kernel (ring 0) → Hardware.
// Geometry is the lesson: stacked bands = the privilege descent a syscall makes;
// side-by-side subsystems = parallel kernel facilities.
//
// Ported 1:1 from graphl-movie/src/scenes/linux.ts — SAME node ids (`lx-*`), colors,
// weighted grid tracks, and edges. graphl-render-app's engine mirrors the reference
// (`wgrid`/`container`/`group` from patterns.ts, the same colors, and every lucide
// icon the `symbol` nodes ride), so no port transforms are needed. The `lx-ns-*` /
// `lx-cg-*` container-primitive ids are reused by any docker scene, so cross-concept
// framing stays consistent.

const G = 0.25

/** A COMPONENT leaf — icon glyph + label (`symbol`). For parts that do/hold/flow. */
const comp = (id: string, label: string, color: string, icon?: string): NodeSeed => ({
  id,
  label,
  color,
  kind: 'symbol',
  cell: [0, 0],
  ...(icon ? { icon } : {}),
})

/** A CHIP — a filled chip whose text IS the concept (`term`). For enumerated options. */
const chip = (id: string, label: string, color: string): NodeSeed => ({ id, label, color, kind: 'term', cell: [0, 0] })

/** Native weighted-track authoring: the grid carries relative track WEIGHTS and each
 *  child's `at` becomes its `cell`, indexing those tracks 1:1 (engine resolves arrays). */
const wg = (spec: WeightedSpec, children: WeightedSeed[]) => wgrid(spec, children)

// ─── USERSPACE BAND (top) ────────────────────────────────────────────────────

const shellCol = container(
  { id: 'lx-shell', label: 'Shell', color: BLUE },
  wg({ cols: [1], rows: [1, 1.8, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'lx-shells', label: 'Shells', color: BLUE },
        wg({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('lx-bash', 'bash', BLUE), at: [0, 0] },
          { node: chip('lx-dash', 'dash', BLUE), at: [1, 0] },
          { node: chip('lx-ash', 'ash', BLUE), at: [2, 0] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'lx-expansion', label: 'Expansion (8 phases)', color: YELLOW },
        wg({ cols: [1, 1, 1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('lx-brace', 'brace', YELLOW), at: [0, 0] },
          { node: chip('lx-tilde', 'tilde', YELLOW), at: [1, 0] },
          { node: chip('lx-pvar', '$var', YELLOW), at: [2, 0] },
          { node: chip('lx-cmdsub', '$(cmd)', YELLOW), at: [3, 0] },
          { node: chip('lx-arith', '$(())', YELLOW), at: [0, 1] },
          { node: chip('lx-split', 'split', YELLOW), at: [1, 1] },
          { node: chip('lx-glob', 'glob', YELLOW), at: [2, 1] },
          { node: chip('lx-quote', 'quote', YELLOW), at: [3, 1] },
        ]),
      ),
      at: [0, 1],
    },
    {
      node: container(
        { id: 'lx-streams', label: 'Streams (fd 0/1/2)', color: TEAL },
        wg({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('lx-stdin', 'stdin', TEAL), at: [0, 0] },
          { node: chip('lx-stdout', 'stdout', TEAL), at: [1, 0] },
          { node: chip('lx-stderr', 'stderr', TEAL), at: [2, 0] },
        ]),
      ),
      at: [0, 2],
    },
  ]),
)

const processCol = container(
  { id: 'lx-process-col', label: 'Process Runtime', color: GREEN },
  wg({ cols: [1], rows: [1.2, 1.2, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'lx-process', label: 'Process', color: GREEN },
        wg({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('lx-fork', 'fork', GREEN), at: [0, 0] },
          { node: chip('lx-exec', 'exec', GREEN), at: [1, 0] },
          { node: chip('lx-wait', 'wait', GREEN), at: [0, 1] },
          { node: chip('lx-exit', 'exit', GREEN), at: [1, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'lx-users', label: 'Users & Groups', color: PURPLE },
        wg({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.22 }, [
          { node: chip('lx-uid', 'uid', PURPLE), at: [0, 0] },
          { node: chip('lx-gid', 'gid', PURPLE), at: [1, 0] },
          { node: chip('lx-sudo', 'sudo', PURPLE), at: [0, 1] },
          { node: chip('lx-passwd', 'passwd', PURPLE), at: [1, 1] },
        ]),
      ),
      at: [0, 1],
    },
    {
      node: container(
        { id: 'lx-perms', label: 'Permissions (DAC)', color: PURPLE },
        wg({ cols: [1, 1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('lx-rwx', 'rwx', PURPLE), at: [0, 0] },
          { node: chip('lx-suid', 'SUID', PURPLE), at: [1, 0] },
          { node: chip('lx-sgid', 'SGID', PURPLE), at: [2, 0] },
          { node: chip('lx-acl', 'ACL', PURPLE), at: [3, 0] },
        ]),
      ),
      at: [0, 2],
    },
  ]),
)

const servicesCol = container(
  { id: 'lx-services-col', label: 'Init & Packages', color: ORANGE },
  wg({ cols: [1], rows: [1.6, 1, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'lx-systemd', label: 'systemd (PID 1)', color: ORANGE },
        wg({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: comp('lx-units', 'Units', ORANGE, 'box'), at: [0, 0] },
          { node: comp('lx-targets', 'Targets', ORANGE, 'layers'), at: [1, 0] },
          { node: comp('lx-journald', 'journald', ORANGE, 'scroll'), at: [2, 0] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'lx-pkg', label: 'Package Mgr', color: RED },
        wg({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: chip('lx-apt', 'apt', RED), at: [0, 0] },
          { node: chip('lx-dnf', 'dnf', RED), at: [1, 0] },
          { node: chip('lx-apk', 'apk', RED), at: [2, 0] },
        ]),
      ),
      at: [0, 1],
    },
    {
      node: container(
        { id: 'lx-boot', label: 'Boot', color: GRAY },
        wg({ cols: [1, 1], rows: [1], gap: 0.15, padding: 0.22 }, [
          { node: comp('lx-grub', 'GRUB', GRAY, 'box'), at: [0, 0] },
          { node: comp('lx-initramfs', 'initramfs', GRAY, 'disk'), at: [1, 0] },
        ]),
      ),
      at: [0, 2],
    },
  ]),
)

const userspace = container(
  { id: 'lx-userspace', label: 'Userspace (ring 3)', color: BLUE },
  wg({ cols: [1, 1, 1], rows: [1], gap: 0.1, padding: 0.1 }, [
    { node: shellCol, at: [0, 0] },
    { node: processCol, at: [1, 0] },
    { node: servicesCol, at: [2, 0] },
  ]),
)

// ─── LIBC BAND ───────────────────────────────────────────────────────────────

const libc = container(
  { id: 'lx-libc', label: 'C Library (libc wraps every syscall)', color: YELLOW },
  wg({ cols: [1, 1], rows: [1], gap: G, padding: 0.3 }, [
    { node: chip('lx-glibc', 'glibc', YELLOW), at: [0, 0] },
    { node: chip('lx-musl', 'musl', YELLOW), at: [1, 0] },
  ]),
)

// ─── SYSCALL BOUNDARY ────────────────────────────────────────────────────────

const syscall = container(
  { id: 'lx-syscall', label: 'Syscall Boundary  —  ~350 syscalls  —  the only legal crossing', color: RED },
  wg({ cols: [1, 1, 1, 1, 1, 1], rows: [1], gap: 0.18, padding: 0.25 }, [
    { node: chip('lx-open', 'open', RED), at: [0, 0] },
    { node: chip('lx-read', 'read', RED), at: [1, 0] },
    { node: chip('lx-write', 'write', RED), at: [2, 0] },
    { node: chip('lx-mmap', 'mmap', RED), at: [3, 0] },
    { node: chip('lx-ioctl', 'ioctl', RED), at: [4, 0] },
    { node: chip('lx-execve', 'execve', RED), at: [5, 0] },
  ]),
)

// ─── KERNEL BAND ─────────────────────────────────────────────────────────────

const vfs = container(
  { id: 'lx-vfs', label: 'VFS', color: BLUE },
  wg({ cols: [1, 1, 1], rows: [1, 1], gap: 0.15, padding: 0.25 }, [
    { node: chip('lx-inode', 'inode', BLUE), at: [0, 0] },
    { node: chip('lx-dentry', 'dentry', BLUE), at: [1, 0] },
    { node: chip('lx-file', 'file', BLUE), at: [2, 0] },
    { node: chip('lx-mount', 'mount', BLUE), at: [0, 1] },
    { node: chip('lx-hardlink', 'hardlink', BLUE), at: [1, 1] },
    { node: chip('lx-symlink', 'symlink', BLUE), at: [2, 1] },
  ]),
)

const scheduler = container(
  { id: 'lx-sched', label: 'Scheduler', color: GREEN },
  wg({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.25 }, [
    { node: comp('lx-pid-table', 'PID Table', GREEN, 'database'), at: [0, 0] },
    { node: comp('lx-runqueue', 'Runqueue', GREEN, 'workflow'), at: [1, 0] },
    { node: chip('lx-nice', 'nice', GREEN), at: [0, 1] },
    { node: chip('lx-sigterm', 'SIGTERM', GREEN), at: [1, 1] },
  ]),
)

const memory = container(
  { id: 'lx-mem', label: 'Memory', color: PURPLE },
  wg({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.25 }, [
    { node: comp('lx-mmu', 'MMU / paging', PURPLE, 'memory'), at: [0, 0] },
    { node: comp('lx-page-cache', 'Page Cache', PURPLE, 'memory'), at: [1, 0] },
    { node: comp('lx-swap', 'Swap', PURPLE, 'disk'), at: [0, 1] },
    { node: comp('lx-oom', 'OOM Killer', PURPLE, 'gears'), at: [1, 1] },
  ]),
)

const blockIO = container(
  { id: 'lx-block', label: 'Block I/O', color: TEAL },
  wg({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.25 }, [
    { node: comp('lx-fs', 'Filesystem', TEAL, 'file'), at: [0, 0] },
    { node: comp('lx-blk', 'Block Dev', TEAL, 'disk'), at: [1, 0] },
    { node: comp('lx-lvm', 'LVM', TEAL, 'layers'), at: [0, 1] },
    { node: comp('lx-raid', 'RAID', TEAL, 'copy'), at: [1, 1] },
  ]),
)

const network = container(
  { id: 'lx-net', label: 'Network', color: ORANGE },
  wg({ cols: [1, 1], rows: [1, 1], gap: 0.15, padding: 0.25 }, [
    { node: comp('lx-sockets', 'Sockets', ORANGE, 'plug'), at: [0, 0] },
    { node: comp('lx-tcp', 'TCP/IP', ORANGE, 'share'), at: [1, 0] },
    { node: comp('lx-netfilter', 'netfilter', ORANGE, 'shield'), at: [0, 1] },
    { node: comp('lx-ssh', 'SSH', ORANGE, 'terminal'), at: [1, 1] },
  ]),
)

const tracing = container(
  { id: 'lx-trace', label: 'Tracing & Debug', color: GRAY },
  wg({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.25 }, [
    { node: chip('lx-strace', 'strace', GRAY), at: [0, 0] },
    { node: chip('lx-perf', 'perf', GRAY), at: [1, 0] },
    { node: chip('lx-ebpf', 'eBPF', GRAY), at: [2, 0] },
  ]),
)

const kernelMain = container(
  { id: 'lx-kernel', label: 'Kernel (ring 0)', color: GREEN },
  wg({ cols: [1, 1, 1], rows: [1, 1], gap: 0.1, padding: 0.1 }, [
    { node: vfs, at: [0, 0] },
    { node: scheduler, at: [1, 0] },
    { node: memory, at: [2, 0] },
    { node: blockIO, at: [0, 1] },
    { node: network, at: [1, 1] },
    { node: tracing, at: [2, 1] },
  ]),
)

const containerPrims = container(
  { id: 'lx-container-prims', label: 'Container Primitives  →  docker', color: RED },
  wg({ cols: [1], rows: [1.7, 1], gap: G, padding: 0.08 }, [
    {
      node: container(
        { id: 'lx-ns', label: 'Namespaces', color: RED },
        wg({ cols: [1, 1, 1], rows: [1, 1], gap: 0.15, padding: 0.25 }, [
          { node: chip('lx-ns-pid', 'pid', RED), at: [0, 0] },
          { node: chip('lx-ns-net', 'net', RED), at: [1, 0] },
          { node: chip('lx-ns-mnt', 'mnt', RED), at: [2, 0] },
          { node: chip('lx-ns-user', 'user', RED), at: [0, 1] },
          { node: chip('lx-ns-uts', 'uts', RED), at: [1, 1] },
          { node: chip('lx-ns-ipc', 'ipc', RED), at: [2, 1] },
        ]),
      ),
      at: [0, 0],
    },
    {
      node: container(
        { id: 'lx-cgroups', label: 'cgroups v2', color: RED },
        wg({ cols: [1, 1, 1], rows: [1], gap: 0.15, padding: 0.25 }, [
          { node: chip('lx-cg-cpu', 'cpu', RED), at: [0, 0] },
          { node: chip('lx-cg-mem', 'mem', RED), at: [1, 0] },
          { node: chip('lx-cg-io', 'io', RED), at: [2, 0] },
        ]),
      ),
      at: [0, 1],
    },
  ]),
)

const fsView = container(
  { id: 'lx-fhs', label: 'Filesystem View', color: GRAY },
  wg({ cols: [1, 1], rows: [1, 1, 1, 1], gap: 0.15, padding: 0.25 }, [
    { node: chip('lx-fhs-proc', '/proc', GRAY), at: [0, 0] },
    { node: chip('lx-fhs-sys', '/sys', GRAY), at: [1, 0] },
    { node: chip('lx-fhs-dev', '/dev', GRAY), at: [0, 1] },
    { node: chip('lx-fhs-etc', '/etc', GRAY), at: [1, 1] },
    { node: chip('lx-fhs-var', '/var', GRAY), at: [0, 2] },
    { node: chip('lx-fhs-home', '/home', GRAY), at: [1, 2] },
    { node: chip('lx-fhs-tmp', '/tmp', GRAY), at: [0, 3] },
    { node: chip('lx-fhs-run', '/run', GRAY), at: [1, 3] },
  ]),
)

// Invisible wrapper (`showChrome: false`) — sub-arranges the kernel main grid, the
// container primitives, and the filesystem view left→right.
const kernelBand = group(
  'lx-kernel-band',
  wg({ cols: [4, 1.4, 1.4], rows: [1], gap: 0.4, padding: 0 }, [
    { node: kernelMain, at: [0, 0] },
    { node: containerPrims, at: [1, 0] },
    { node: fsView, at: [2, 0] },
  ]),
)

// ─── HARDWARE BAND ───────────────────────────────────────────────────────────

const hardware = container(
  { id: 'lx-hw', label: 'Hardware', color: GRAY },
  wg({ cols: [1, 1, 1, 1], rows: [1], gap: G, padding: 0.3 }, [
    { node: comp('lx-cpu', 'CPU (rings 0/3)', PURPLE, 'engine'), at: [0, 0] },
    { node: comp('lx-ram', 'RAM', BLUE, 'memory'), at: [1, 0] },
    { node: comp('lx-disk', 'Block Devices', TEAL, 'disk'), at: [2, 0] },
    { node: comp('lx-nic', 'NIC', ORANGE, 'share'), at: [3, 0] },
  ]),
)

// ─── THE FIVE BANDS ──────────────────────────────────────────────────────────
// No outer "Linux" wrapper: the brand bar already labels the concept and each band
// is self-titled, so the five privilege bands sit directly on the scene grid.

const bands: SceneNodeSpec[] = [
  { ...userspace, cell: [0, 0] },
  { ...libc, cell: [0, 1] },
  { ...syscall, cell: [0, 2] },
  { ...kernelBand, cell: [0, 3] },
  { ...hardware, cell: [0, 4] },
]

export const linux: SceneSpec = {
  id: 'linux',
  title: 'Linux — the full stack',
  // The source map's 30×22 frame (≈1.36:1) so the stacked bands keep their shape.
  canvas: { width: 1440, height: 1056 },
  grid: { cols: [1], rows: [6, 1.2, 1.2, 9, 2.0], gap: 0.4, padding: 0.12 },
  nodes: bands,
  edges: [
    // Shell parses → forks → execs (process lifecycle)
    { from: 'lx-bash', to: 'lx-expansion', label: 'parse' },
    { from: 'lx-expansion', to: 'lx-fork', label: 'fork()' },
    { from: 'lx-fork', to: 'lx-exec', label: 'replace' },
    { from: 'lx-exec', to: 'lx-wait', label: 'wait()' },
    { from: 'lx-wait', to: 'lx-exit', label: 'reap' },

    // Boot chain + systemd parenting userspace
    { from: 'lx-grub', to: 'lx-initramfs', label: 'load' },
    { from: 'lx-initramfs', to: 'lx-systemd', label: 'pivot_root' },
    { from: 'lx-systemd', to: 'lx-process', label: 'spawn (PID 1)' },
    { from: 'lx-targets', to: 'lx-units', label: 'group' },
    { from: 'lx-units', to: 'lx-journald', label: 'log' },

    // Package mgr installs userspace
    { from: 'lx-pkg', to: 'lx-shells', label: 'install' },

    // Userspace → libc → syscall
    { from: 'lx-process', to: 'lx-glibc', label: 'lib call' },
    { from: 'lx-glibc', to: 'lx-syscall', label: 'syscall' },

    // Syscall → kernel subsystems
    { from: 'lx-open', to: 'lx-vfs', label: 'lookup' },
    { from: 'lx-read', to: 'lx-vfs', label: 'vfs_read' },
    { from: 'lx-mmap', to: 'lx-mem', label: 'map page' },
    { from: 'lx-execve', to: 'lx-sched', label: 'new task' },
    { from: 'lx-ioctl', to: 'lx-block', label: 'device' },

    // VFS → page cache → block → disk (file read path)
    { from: 'lx-vfs', to: 'lx-page-cache', label: 'cache' },
    { from: 'lx-vfs', to: 'lx-fs', label: 'mount' },
    { from: 'lx-fs', to: 'lx-blk', label: 'block req' },
    { from: 'lx-lvm', to: 'lx-blk', label: 'lv map' },
    { from: 'lx-raid', to: 'lx-blk', label: 'stripe' },
    { from: 'lx-block', to: 'lx-disk', label: 'DMA' },

    // VFS file-type relations
    { from: 'lx-hardlink', to: 'lx-inode', label: 'shares' },
    { from: 'lx-symlink', to: 'lx-inode', label: 'points' },

    // Memory → RAM, swap → disk
    { from: 'lx-mem', to: 'lx-ram', label: 'translate' },
    { from: 'lx-mem', to: 'lx-disk', label: 'swap out' },
    { from: 'lx-oom', to: 'lx-process', label: 'kill -9' },

    // Scheduler → CPU, signals → process
    { from: 'lx-sched', to: 'lx-cpu', label: 'dispatch' },
    { from: 'lx-nice', to: 'lx-runqueue', label: 'priority' },
    { from: 'lx-sigterm', to: 'lx-process', label: 'signal' },

    // Network → NIC
    { from: 'lx-sockets', to: 'lx-tcp', label: 'send' },
    { from: 'lx-net', to: 'lx-nic', label: 'frames' },
    { from: 'lx-netfilter', to: 'lx-tcp', label: 'filter' },
    { from: 'lx-ssh', to: 'lx-sockets', label: 'tcp/22' },

    // Virtual filesystems: kernel exposes state
    { from: 'lx-sched', to: 'lx-fhs-proc', label: 'expose pids' },
    { from: 'lx-block', to: 'lx-fhs-sys', label: 'expose subsys' },

    // Access control checks at every boundary
    { from: 'lx-rwx', to: 'lx-vfs', label: 'DAC check' },
    { from: 'lx-perms', to: 'lx-process', label: 'elevate' },
    { from: 'lx-passwd', to: 'lx-uid', label: 'resolves' },

    // Container primitives: isolate + limit (bridge to docker)
    { from: 'lx-ns-pid', to: 'lx-process', label: 'isolate pid' },
    { from: 'lx-ns', to: 'lx-net', label: 'isolate net' },
    { from: 'lx-cg-cpu', to: 'lx-sched', label: 'throttle' },
    { from: 'lx-cg-mem', to: 'lx-mem', label: 'limit' },

    // Tracing hooks
    { from: 'lx-strace', to: 'lx-syscall', label: 'intercept' },
    { from: 'lx-trace', to: 'lx-cpu', label: 'sample' },
  ],
}
