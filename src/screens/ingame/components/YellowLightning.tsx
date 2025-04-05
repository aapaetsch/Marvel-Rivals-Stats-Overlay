import "./styles/screen.css"; // Import your CSS styles here
// components/YellowLightning.tsx
const YellowLightning = () => (
  <svg
    className="lightning-bolt"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon
      points="24,2 4,36 26,36 20,62 52,24 30,24 40,2"
      fill="yellow"
      stroke="#fff700"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export default YellowLightning;
