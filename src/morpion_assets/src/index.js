import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as morpion_idl, canisterId as morpion_id } from 'dfx-generated/morpion';

const agent = new HttpAgent();
const morpion = Actor.createActor(morpion_idl, { agent, canisterId: morpion_id });

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  const greeting = await morpion.greet(name);

  document.getElementById("greeting").innerText = greeting;
});
