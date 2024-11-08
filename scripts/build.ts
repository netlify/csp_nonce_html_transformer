async function main() {
  await Deno.run({ 
    cmd: ['wasm-pack', 'build', '--target', 'web'],
  }).status();
  await Deno.remove("./pkg/.gitignore");
}

main();
