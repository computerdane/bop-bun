{
  bun,
  makeWrapper,
  stdenv,
}:

stdenv.mkDerivation {
  pname = "bop";
  version = "0.0.1";

  src = ./.;

  buildInputs = [
    bun
    makeWrapper
  ];

  installPhase = ''
    mkdir -p $out/lib
    cp $src/*.ts $out/lib/
    makeWrapper ${bun}/bin/bun $out/bin/bop \
      --add-flags "$out/lib/bop.ts"
  '';
}
