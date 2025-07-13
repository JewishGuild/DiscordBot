import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { DiscordSDK } from "@discord/embedded-app-sdk";
import { AuthService } from "@/Services/Backend/Auth/auth.service";

function App() {
  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

  setupDiscordSdk().then(() => {
    console.log("Discord SDK is authenticated");
  });

  async function setupDiscordSdk() {
    await discordSdk.ready();
    console.log("Discord SDK is ready");

    const { code } = await discordSdk.commands.authorize({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "guilds", "applications.commands", "guilds.members.read"]
    });

    const authService = new AuthService();
    const { data } = await authService.token({ code });
    console.log(data);

    const auth = await discordSdk.commands.authenticate({
      access_token: data.access_token
    });

    if (auth == null) {
      throw new Error("Authenticate command failed");
    }
  }

  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
