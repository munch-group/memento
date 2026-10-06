https://github.com/microsoft/vscode-remote-release/issues/3066#issuecomment-1019500216

As promised, here are some instructions on how to use Singularity with VS-Code Remote SSH via SSH RemoteCommand. The procedure described below makes VS-Code run it’s remote server component inside a Singularity container instance (other runtimes like Shifter work too).

Acknowledgement: Credit for a lot of this goes to @gipert, who refined my original approach (using a custom SSH script) when support for RemoteCommand became available in VS-Code recently

Step 1

Use VS-Code >= v1.64 (includes support for the SSH RemoteCommand setting). Install the Pre-Release version of the Remote SSH extension

Important: In the VS-Code settings, set "remote.SSH.enableRemoteCommand": true.

Step 2

```
In your "$HOME/.ssh/config", add something like

Host myimage1~*
  RemoteCommand singularity shell /path/to/image1.sif
  RequestTTY yes

Host myimage2~*
  RemoteCommand singularity shell /path/to/image2.sif
  RequestTTY yes

Host somehost myimage1~somehost myimage2~somehost
  HostName some.host.somewhere
  User your_username_

Host otherhost myimage1~otherhost myimage2~otherhost
  HostName some.otherhost.somewhere
  User your_username_
```

Test whether this works using ssh myimage1~somehost. This should drop you into an SSH session inside of an instance of the "/path/to/image1.sif" container image on some.host.somewhere.

Connecting to the remote host with VS-Code: F1 > "Connect to Host" > `"myimage1~somehost”` should now get you a remote VS-Code session running in the container image as well. The same for `"myimage2~somehost"`, `"myimage1~otherhost"` and `"myimage2~otherhost"`.

Step 3

However, since VS-code reuses remote server instance, that's not sufficient to run multiple container images on the same host at the same time. To get separate (per container) VS-Code server instances the same host, add something like this to your VS-Code preferences:

```
"remote.SSH.serverInstallPath": {
  "myimage1~somehost": "~/.vscode-container/myimage1",
  "myimage1~otherhost": "~/.vscode-container/myimage1",
  "myimage2~somehost": "~/.vscode-container/myimage2",
  "myimage2~otherhost": "~/.vscode-container/myimage2"
}
```

Request to the VS-Code dev team

Could "remote.SSH.serverInstallPath" be controlled via an environment variable? This would allow us to eliminate all these cumbersome "remote.SSH.serverInstallPath" preferences. The environment variable could be set by a container startup script on the remote side (like the one below) automatically, depending on the selected container image.

Other Container runtimes

To use a different container runtime than Singularity (e.g. Shifter, Charliecloud, etc.), simply replace singularity shell `/path/to/image1.sif` by the appropriate command for your runtime.

On some systems (e.g. with Shifter at NERSC) you may also need to override `$XDG_RUNTIME_DIR`, since it's default location may not be writable from within a container instance. In such cases, it's best to use a custom container run-script like

```
#!/bin/sh
export XDG_RUNTIME_DIR="${TMPDIR:-/tmp}/`whoami`/run"
exec shifter --image="$1"
```

So in your SSH config, use

RemoteCommand /my/homedir/.local/bin/run_container image_name

I maintain a little container start-script called cenv that handles $XDG_RUNTIME_DIR (and quite a bit more, including some default bind-mounts) automatically for both Singularity and Shifter (contributions welcome).

Tips and tricks

If things don't work, try "Kill server on remote" from VS-Code and reconnect.

You can also try starting over from scratch with brute force: Close the VS-Code remote connection. Then, from an external terminal, kill the remote VS-Code server instance:

```
$ ssh somehost
$ kill -9 -1
(Will kill all processes you own on the remote host.)
```

Remove the ~/.vscode-server directory.