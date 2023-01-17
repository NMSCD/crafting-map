export function Slider({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  const change = () => onChange(!checked);
  const bcgClass = `bcg${checked ? "" : " on"}`;

  return (
    <div className="slider" onClick={change}>
      <div className={bcgClass}></div>
      <div>Recipe</div>
      <div>Usage</div>
    </div>
  );
}
