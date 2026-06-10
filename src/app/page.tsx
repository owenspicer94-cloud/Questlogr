import Header from "./components/Header";
import Timeline from "./components/Timeline";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <Header />
      <Timeline />
    </main>
  );
}
