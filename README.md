# Sociograph: Relationship Analyst

Sociograph is a high-performance **Actor Mapping** and **Social Network Analysis (SNA)** tool designed for analysts, researchers, and project managers. It provides a specialized environment for visualizing complex stakeholder ecosystems, tracking influence, and calculating network dependencies.

![Sociograph Interface](https://images.unsplash.com/photo-1551288049-bbda48658a7d?auto=format&fit=crop&q=80&w=1200)

## 🚀 Key Features

*   **Interactive Network Map**: A force-directed graph visualization using D3-inspired physics for exploring actor relationships.
*   **Dual-View Interface**: Switch between a visual **Network Map** and a high-precision **Relationship Matrix** for data entry.
*   **Centrality Metrics**: Real-time calculation of **Degree Centrality** and **Influence Scores** to identify key actors.
*   **Flexible Schema**: Create custom Actor Categories and Dependency Types with specific visual styles.
*   **Offline First (PWA)**: Installable as a Progressive Web App for desktop-like performance and offline use.
*   **Data Portability**: Import/Export your entire analysis as JSON or download the visual map as a high-quality SVG.
*   **Privacy-Focused**: All data stays in your browser's local storage. This tool works entirely client-side.

## 🛠 Technical Stack

*   **Frontend**: React 18 + TypeScript
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Visualization**: Custom SVG engine with interactive physics
*   **Build Tool**: Vite

## 📦 Local Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run development server**:
    ```bash
    npm run dev
    ```
4.  **Build for production**:
    ```bash
    npm run build
    ```

## 🌐 Hosting on GitHub Pages

This project is configured with a GitHub Action for automatic deployment.

1.  **Create a new Repository** on GitHub named `sociograph` (or your preferred name).
2.  **Push your code** to the `main` branch:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/sociograph.git
    git branch -M main
    git push -u origin main
    ```
3.  **Enable GitHub Pages**:
    *   Go to **Settings** > **Pages** in your GitHub repo.
    *   Under **Build and deployment** > **Source**, select **GitHub Actions**.
4.  The tool will automatically build and deploy whenever you push to `main`.

## 📱 Progressive Web App (PWA)

Sociograph can be "installed" on your computer or mobile device. Look for the **Install** icon in your browser's address bar (Chrome/Edge) or use "Add to Home Screen" on iOS.

## 🛡 Security & Privacy

*   **Zero Server Dependency**: This tool does not send your graph data to any server.
*   **LocalStorage Persistence**: Data is saved to your browser's internal storage and persists across reloads.
*   **Encrypted Connections**: When hosted on platforms like GitHub Pages, all traffic is served over HTTPS.

---
Built with ❤️ for the analyst community.
