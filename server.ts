import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Send Email Summary
  app.post("/api/send-summary", async (req, res) => {
    const { email, leadData, summary } = req.body;
    
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. Email skipped.");
      return res.status(200).json({ success: true, message: "Email simulation successful (Key missing)" });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "LeadGen AI <leads@resend.dev>",
        to: [email],
        subject: `New Hot Lead: ${leadData.name}`,
        html: `
          <h1>New Lead Qualified</h1>
          <p><strong>Name:</strong> ${leadData.name}</p>
          <p><strong>Phone:</strong> ${leadData.phone}</p>
          <p><strong>Property:</strong> ${leadData.address}</p>
          <hr/>
          <h3>AI Prescreening Summary:</h3>
          <p>${summary}</p>
        `,
      });

      if (error) return res.status(400).json({ error });
      res.status(200).json({ data });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
