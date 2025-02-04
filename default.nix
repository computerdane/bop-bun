{
  bun,
  stdenv,
  writeShellApplication,
}:

let
  bop = writeShellApplication {
    name = "bop";
    runtimeInputs = [ bun ];
    text = "bun bop.ts";
  };
in
stdenv.mkDerivation {
  pname = "bop";
  version = "0.0.1";

  src = ./.;

  installPhase = ''
    mkdir -p $out/bin
    cp $src/bop.ts $out/bin/bop.ts
    cp ${bop}/bin/bop $out/bin/bop
  '';
}
