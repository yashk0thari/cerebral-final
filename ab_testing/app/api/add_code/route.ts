import { NextResponse } from "next/server";
import { db } from "@/app/firebase";
import { collection, doc, addDoc } from "firebase/firestore";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    console.log("Received code in API:", code);

    const componentId = "0VvO4r1T1PwSTa6pr0nt";
    const codesCollectionRef = collection(
      db,
      "component",
      componentId,
      "codes"
    );

    const newCodeDoc = await addDoc(codesCollectionRef, { code });

    console.log("Code added to Firebase with ID:", newCodeDoc.id);

    // Run the shell script
    const scriptPath = path.join(process.cwd(), "../clone-app.sh");
    console.log("Attempting to execute script at:", scriptPath);

    if (fs.existsSync(scriptPath)) {
      console.log("Script file exists");
      const scriptContent = fs.readFileSync(scriptPath, "utf-8");
      console.log("Script content:", scriptContent);
    } else {
      console.log("Script file does not exist");
    }

    try {
      const lsOutput = execSync("ls -l", { encoding: "utf-8" });
      console.log("ls output:", lsOutput);

      console.log("Executing script...");
      const output = execSync(`bash ${scriptPath}`, { encoding: "utf-8" });
      console.log("Script output:", output);

      return NextResponse.json(
        {
          message: "Code added successfully and script executed",
          id: newCodeDoc.id,
          output: output,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Script execution error:", error);
      return NextResponse.json(
        {
          message: "Code added successfully, but script execution failed",
          id: newCodeDoc.id,
          error: error.message,
          stderr: error.stderr,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error adding code to Firebase or running script: ", error);
    return NextResponse.json(
      { error: "Failed to add code or run script" },
      { status: 500 }
    );
  }
}
