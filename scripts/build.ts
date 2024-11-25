async function main() {
  await Deno.run({
    cmd: ["wasm-pack", "build", "--target", "web", "--release"],
  }).status();
  await Deno.remove("./pkg/.gitignore");
  const pkg = await import("../pkg/package.json", {
    with: { type: "json" },
  });
  const wasmFile = pkg.default.files.find((name: string) =>
    name.endsWith(".wasm")
  );
  await Deno.writeTextFile(
    "./pkg/embedded-wasm.ts",
    `export const wasmBinary = Uint8Array.from(${
      JSON.stringify(
        Array.from(
          await Deno.readFile(
            `./pkg/${wasmFile}`,
          ),
        ),
      )
    });`,
  );
}

main();
