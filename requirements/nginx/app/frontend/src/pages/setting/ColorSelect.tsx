import { FC } from "react";

type ColorOption = {
  name: string;
  color: string;
};

interface ColorSelectProps {
  name: string;
  colorOptions: ColorOption[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}


const ColorSelect: FC<ColorSelectProps> = (props) => {
  const handleChange = (color: string) => {
    props.setSelectedColor(color);
  };

  return (
    <div className="flex items-center">
      <div className="text-xl font-semibold mr-5 w-16">{props.name}</div>
      <div className="flex gap-2">
        {props.colorOptions.map((color) => (
          <label key={color.color} className="relative flex items-center justify-center">
            <input
              type="radio"
              name="color"
              value={'#' + color.color}
              className="sr-only" // Hide the radio input itself
              checked={props.selectedColor === color.color}
              onChange={() => handleChange(color.color)}
            />
            <span
              className={`size-6 rounded-full inline-block cursor-pointer
              ${
                color.color === "FFFFFF" && "border border-black"
              }
              ${
                color.color === "000000" && "border border-white"
              }
              ${
                props.selectedColor === color.color ? "ring-4 dark:ring-[#cfcfcf] ring-[#666666]" : ""
              }`}
              style={{
                backgroundColor: "#" + color.color,
              }}
            ></span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ColorSelect;
