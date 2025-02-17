import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    resume: {
      type: "boolean",
      short: "r",
      default: false,
    },
    host: {
      type: "string",
      short: "h",
      default: "nf6.sh",
    },
    dir: {
      type: "string",
      short: "d",
      default: "/nas",
    },
    unref: {
      type: "boolean",
      short: "u",
      default: false,
    },
    album: {
      type: "boolean",
      short: "a",
      default: false,
    },
  },
  strict: true,
  allowPositionals: true,
});

let command = "";
if (values.album) {
  command = "fd . --type directory | fzf";
} else {
  command = "fzf";
}

const ssh1 = Bun.spawn(
  ["ssh", "-t", values.host, `cd ${values.dir} && ${command} > /tmp/bop`],
  {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  },
);
await ssh1.exited;
if (ssh1.exitCode) {
  process.exit(ssh1.exitCode);
}

const ssh2 = Bun.spawn(["ssh", values.host, "cat /tmp/bop"]);
const output2 = (await new Response(ssh2.stdout).text()).trim();
if (ssh2.exitCode) {
  process.exit(ssh1.exitCode);
}

let paths = [];
if (values.album) {
  const ssh3 = Bun.spawn(["ssh", values.host, `ls "${values.dir}/${output2}"`]);
  const output3 = (await new Response(ssh3.stdout).text()).trim();
  if (ssh3.exitCode) {
    process.exit(ssh3.exitCode);
  }
  paths = output3.split("\n");
  for (const [i, path] of paths.entries()) {
    paths[i] = `${output2}/${path}`;
  }
} else {
  paths = [output2];
}

const mpvArgs = [];
for (const path of paths) {
  mpvArgs.push(`sftp://${values.host}:${values.dir}/${path}`);
}

if (values.resume) {
  mpvArgs.push("--save-position-on-quit");
} else {
  mpvArgs.push("--no-resume-playback");
}
const mpv = Bun.spawn(["mpv", ...mpvArgs], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});
if (values.unref) {
  mpv.unref();
}
