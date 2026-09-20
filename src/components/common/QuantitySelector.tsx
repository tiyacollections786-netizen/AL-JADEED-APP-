import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max?: number;
  pricePerHen: number;
  currencySymbol?: string;
  onChange: (quantity: number) => void;
  showPresets?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  min = 1,
  max = 100,
  pricePerHen,
  currencySymbol = 'Rs.',
  onChange,
  showPresets = true,
}) => {
  const handleDecrement = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      onChange(min);
    } else {
      const clamped = Math.max(min, Math.min(max, val));
      onChange(clamped);
    }
  };

  const presets = [1, 2, 5, 10, 20].filter(p => p >= min && p <= max);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Select Hen Quantity
        </label>
        <span className="text-xs text-slate-500">
          Min: {min} | Max: {max} hens
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center border border-slate-300 rounded-xl bg-white shadow-xs p-1">
          <button
            type="button"
            id="qty-decrement-btn"
            onClick={handleDecrement}
            disabled={quantity <= min}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>

          <input
            type="number"
            id="qty-input-field"
            value={quantity}
            min={min}
            max={max}
            onChange={handleInputChange}
            className="w-16 text-center font-bold text-lg text-slate-900 focus:outline-hidden bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            type="button"
            id="qty-increment-btn"
            onClick={handleIncrement}
            disabled={quantity >= max}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showPresets && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {presets.map(preset => (
              <button
                key={preset}
                type="button"
                id={`preset-${preset}-btn`}
                onClick={() => onChange(preset)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  quantity === preset
                    ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {preset} {preset === 1 ? 'Hen' : 'Hens'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Total Calculation Card */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-amber-800/80 font-medium">
            {currencySymbol} {pricePerHen.toLocaleString()} × {quantity} {quantity === 1 ? 'Hen' : 'Hens'}
          </p>
          <p className="text-xs text-slate-500">Live Total Investment</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-extrabold text-amber-900 tracking-tight">
            {currencySymbol} {(pricePerHen * quantity).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
