import { useState } from "react";
import {getTokenIcon} from "../utilities/getTokenIcon.ts";

type Props = {
  options?: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};


export default function AutocompleteInput({
                                            options = [],
                                            value,
                                            onChange,
                                            placeholder,
                                          }: Props) {
  const [open, setOpen] = useState(false);
  
  const filteredOptions = options.filter((item) =>
    item.toLowerCase().includes(value.toLowerCase())
  );
  
  return (
    <div className="relative">
      {/* Input */}
      <div className="relative">
        {value && (
          <img
            src={getTokenIcon(value)}
            alt={value}
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
            onError={(e) =>
              ((e.target as HTMLImageElement).style.display = "none")
            }
          />
        )}
        
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full border rounded-lg pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Dropdown */}
      {open && filteredOptions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((item) => (
            <div
              key={item}
              onMouseDown={() => {
                onChange(item);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <img
                src={getTokenIcon(item)}
                alt={item}
                className="w-5 h-5"
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}