import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    beginning: {
      type: "boolean",
      short: "b",
      default: false,
    },
    "no-save": {
      type: "boolean",
      short: "n",
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
  },
  strict: true,
  allowPositionals: true,
});

const ssh1 = Bun.spawn(
  ["ssh", "-t", values.host, "cd " + values.dir + "&& fzf > /tmp/bop"],
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
const path = (await new Response(ssh2.stdout).text()).trim();
if (ssh2.exitCode) {
  process.exit(ssh1.exitCode);
}

const mpvArgs = ["sftp://" + values.host + ":" + values.dir + "/" + path];
if (values.beginning) {
  mpvArgs.push("--no-resume-playback");
}
if (!values["no-save"]) {
  mpvArgs.push("--save-position-on-quit");
}
const mpv = Bun.spawn(["mpv", ...mpvArgs], {
  stdout: "inherit",
  stderr: "inherit",
});
mpv.unref();
