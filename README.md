<div align="center">
  <img src="images/Omni-Endo-AI.png" alt="Omni-Endo AI Header" width="100%">
</div>

# OMNI-ENDO AI
**Clinical Audit & Triage Tool: AI-Powered Data Insights for Diabetes**

---

## 🌟 What is Omni-Endo AI?
**Omni-Endo AI** is a bridge between your diabetes data and the power of Artificial Intelligence. 

Managing Type 1 Diabetes involves a mountain of data—basal rates, insulin-to-carb ratios, and glucose trends. While systems like Glooko store this data, it can be overwhelming for a human to spot every pattern. This tool allows you to securely pull your data into a simple dashboard, where you can then "hand it over" to an AI (like ChatGPT or Claude) to act as a second pair of eyes for clinical auditing and triage.

### Why I Built This
I built this tool to put the power back into the hands of the patient. Modern healthcare is busy, and we often only get 15 minutes with a consultant every few months. This tool allows you to:
1. **Be Proactive:** Spot trends before your next appointment.
2. **Be Private:** Your data stays on your machine.
3. **Be Flexible:** You choose which AI helps you.

### 🧠 The "No-API" Philosophy (Why this is different)
Most AI tools require "API Keys"—which are essentially digital credit cards. If I had built this using APIs:
* **You would have to pay:** Every time the AI analyzed your data, you'd be charged a small fee.
* **You'd be "Locked In":** You would be forced to use whatever AI model I chose for you.
* **It's Complicated:** Setting up developer accounts is a nightmare for most people.

**Instead, Omni-Endo AI uses a "Manual Hand-off."** The tool prepares a perfectly formatted report for you to simply **Copy and Paste** into your favorite AI chat window (ChatGPT, Claude, Gemini, etc.). You use the tools you already have, and you pay nothing extra.

---

## 🛠️ Step 1: Getting Ready (Installing Docker)
To run this tool, we use a piece of software called **Docker**. Think of Docker as a "shipping container" for apps—it ensures that Omni-Endo AI runs perfectly on your computer without you having to install complicated code libraries.

### **For Windows Users**
1. **Download:** Go to the [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) page and click **Download for Windows**.
2. **Install:** Run the `.exe` file. **Important:** During installation, ensure the box that says **"Use WSL 2 instead of Hyper-V"** is checked.
3. **Restart:** Your computer will likely ask you to restart.
4. **Start:** After restarting, open the "Docker Desktop" app from your Start Menu. Accept the terms of service.

### **For Mac Users**
1. **Download:** Go to the [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) page. 
   - Choose **"Apple Chip"** if you have a newer Mac (M1, M2, M3).
   - Choose **"Intel Chip"** if you have an older Mac.
2. **Install:** Open the `.dmg` file and drag the Docker icon into your **Applications** folder.
3. **Start:** Open Docker from your Applications folder. You may need to enter your Mac password to grant it permission to run.

---

## 📂 Step 2: Setting up the Folder
You need to get the files from this GitHub page onto your computer.

1. **Download the Code:** - On this GitHub page, click the green **"<> Code"** button near the top.
   - Click **"Download ZIP"**.
2. **Extract:** Open your Downloads folder, right-click the zip file, and choose **"Extract All"**.
3. **Move:** Move that extracted folder (let's call it `omni-endo-ai`) to somewhere easy to find, like your **Desktop**.

Your folder should look like this inside:
* `public/` (folder)
* `images/` (folder)
* `docker-compose.yml`
* `Dockerfile`
* `server.js`
* ...and a few other small files.

---

## 🚀 Step 3: Running the Tool
Now we tell Docker to "turn on" the tool.

1. **Open a Terminal:**
   - **Windows:** Search for "PowerShell" in your start menu and open it.
   - **Mac:** Search for "Terminal" in Spotlight (Cmd + Space) and open it.
2. **Go to the folder:** Type `cd` followed by a space, then drag your `omni-endo-ai` folder from your desktop directly into the terminal window. It will look something like this:
   `cd C:\Users\YourName\Desktop\omni-endo-ai`
   *Hit Enter.*
3. **Start the Engine:** Type exactly this command and hit Enter:
   ```bash
   docker-compose up --build
   ```
4. **Wait:** The first time you do this, Docker will download the "engine" (Node.js). It might take a minute or two. When you see a message saying Server running at http://localhost:4000, you are ready!

---

## 💻 Step 4: Using the Web Page

1. **Open your Browser:** Go to http://localhost:4000.
2. **Enter Credentials:** Enter your Glooko login details. 
   > **Privacy Note:** These details are **not** sent to me. They are sent directly from your computer to Glooko's servers to fetch your data.
3. **Generate Report:** Once the data is fetched, the tool will create a "Clinical Audit Summary."
4. **The AI Hand-off:**
   - Click the **"Copy for AI"** button.
   - Open your favorite AI (e.g., [chatgpt.com](https://chatgpt.com)).
   - Paste the text and hit Enter.
   - Watch as the AI analyzes your insulin ratios, basal patterns, and glucose trends!

---

## 🛑 How to Stop
When you are finished, go back to your Terminal/PowerShell window and press **Ctrl + C**. This will turn off the server.

---

### **Disclaimer**
*This tool is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Use of AI analysis should always be reviewed by a qualified clinical professional before making any changes to your insulin therapy or medical regimen.*
