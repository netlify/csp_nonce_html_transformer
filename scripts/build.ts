async function main() {
  await Deno.run({
    cmd: ["wasm-pack", "build", "--target", "web", "--release"],
  }).status();
  await Deno.remove("./pkg/.gitignore");
}

main();
