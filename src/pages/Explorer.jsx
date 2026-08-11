import PCScene from '../three/PCScene.jsx';
import './Explorer.css';

export default function Explorer() {
  return (
    <div className="explorer-page">
      <section className="explorer-hero">
        <h1>3D PC Explorer</h1>
        <p>Rotate, zoom, and click on any component to learn what it does and how it works inside your PC.</p>
      </section>

      <PCScene />
    </div>
  );
}
