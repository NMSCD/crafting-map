export function Slider({ checked, onChange }: { checked: boolean; onChange: (boolean) => void }) {
  const change = () => onChange(!checked);
  const bcgClass = `bcg${checked ? "" : " on"}`;

  return (
    <div className="slider" onClick={change}>
      <div className={bcgClass}></div>
      <div>Products</div>
      <div>Sources</div>
    </div>
  );
}
