

# STEM AI Visualizer

### AI-Powered Physics Problem Simulator


 1. Project Title

**STEM AI Visualizer – AI-Powered Physics Problem Simulator**

https://lovable.dev/projects/25a32196-3d85-4e64-99be-6e5a4ee7d032

2. Description

STEM AI Visualizer is an intelligent web application that transforms physics word problems into interactive visual simulations.

The system accepts natural language input, uses AI to extract motion type and physical parameters, and automatically generates real-time simulations along with dynamic graphs. It enables learners to experiment with parameters through “What-If” mode and observe instant visual feedback.

This project bridges the gap between textual problem statements and conceptual understanding by combining AI with a custom-built physics engine.

---

  3. Tech Stack Used
  
 🔹 Frontend

* React
* TypeScript
* Tailwind CSS
* ShadCN UI
* Lucide Icons

 🔹 Backend

* Supabase
* Supabase Authentication
* Supabase Edge Functions
* AI-based NLP Parsing

🔹 Core Engine

* Custom Physics Simulation Engine
* Frame-based trajectory generation
* Graph visualization system

 
 4. How to Run the Project

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/stem-ai-visualizer.git
cd stem-ai-visualizer
```

### Step 2: Install Dependencies

bash
npm install


### Step 3: Setup Environment Variables

Create a `.env` file and add:


VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key


### Step 4: Run the Development Server

bash
npm run dev


Open:

http://localhost:5173



 5. Dependencies

Main dependencies include:

* react
* react-router-dom
* typescript
* tailwindcss
* lucide-react
* @supabase/supabase-js
* shadcn/ui components

Install all dependencies using:

`bash
npm install


6. Important Instructions

* Make sure Supabase authentication is properly configured.
* Ensure Edge Function (`parse-physics`) is deployed in Supabase.
* The AI parser must return structured physics parameters.
* Do not remove DEFAULT_PARAMS — they ensure fallback safety.
* Use stable internet connection for AI parsing.


7. Demo Video of MVP


https://drive.google.com/drive/folders/1KeNtTWsoLw8BPjDS7Hwl06onrfjUYXHz?usp=sharing

8. Demo Images of MVP


https://drive.google.com/drive/folders/15XVVNN9FZPwRknLEBYKS6ll0Y2hXTlFw?usp=sharing

 Motion Types Supported

* Vertical Motion
* Horizontal Motion
* Projectile Motion
* Simple Harmonic Motion


 Educational Impact

* Improves conceptual clarity
* Encourages experimentation
* Makes abstract physics intuitive
* Bridges theory with visualization

 Future Scope

* 3D simulations
* Voice-based input
* AI tutoring assistant
* Advanced motion models
* Learning analytics integration
