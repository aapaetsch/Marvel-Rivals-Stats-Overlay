import React from 'react';
import { Form, Slider } from 'antd';
import { useTranslation } from 'react-i18next';
import { SliderMarks } from 'antd/lib/slider';

interface CardSettingsRowSliderProps {
  /**
   * The label to display for this setting
   */
  label: string;
  
  /**
   * The form field name to bind to
   */
  formName: string;
  
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean;
  
  /**
   * Minimum value for the slider
   */
  min?: number;
  
  /**
   * Maximum value for the slider
   */
  max?: number;
  
  /**
   * Step value for the slider
   */
  step?: number;
  
  /**
   * Marks to display on the slider
   */
  marks?: SliderMarks;

  /**
   * Whether to show percentage values on the slider marks
   */
  showPercentage?: boolean;
  
  /**
   * Optional callback function when the slider value changes
   */
  onChange?: (value: number) => void;
  
  /**
   * Whether to add indentation to the label
   */
  indented?: boolean;
    /**
   * Whether the label should be stacked above the slider 
   * and aligned to the right
   */
  stackedLabel?: boolean;
}

/**
 * A reusable component for creating slider settings rows
 */
const CardSettingsRowSlider: React.FC<CardSettingsRowSliderProps> = ({
  label,
  formName,
  disabled = false,
  min = 0,
  max = 100,
  step = 1,
  marks,
  onChange,
  indented = true,
  showPercentage = true,
  stackedLabel = false
}) => {
  const { t } = useTranslation();
  
  // Generate default marks if not provided
  const defaultMarks = showPercentage ? {
    [min]: `${min}%`,
    [Math.round((max - min) / 3 + min)]: `${Math.round((max - min) / 3 + min)}%`,
    [Math.round((max - min) * 2 / 3 + min)]: `${Math.round((max - min) * 2 / 3 + min)}%`,
    [max]: `${max}%`
  } : {
    [min]: min,
    [Math.round((max - min) / 3 + min)]: Math.round((max - min) / 3 + min),
    [Math.round((max - min) * 2 / 3 + min)]: Math.round((max - min) * 2 / 3 + min),
    [max]: max
  };
  
  const sliderMarks = marks || defaultMarks;
    return (
    <div className={`card-settings-row slider-row ${stackedLabel ? 'stacked-label' : ''}`}>
      {stackedLabel ? (
        <>
          <div className="card-settings-stacked-container">
            <div className="card-settings-stacked-label">
              {label}
            </div>
            <Form.Item 
              name={formName} 
              noStyle
            >
              <Slider
                min={min}
                max={max}
                step={step}
                marks={sliderMarks}
                disabled={disabled}
                onChange={onChange}
                className="settings-slider"
              />
            </Form.Item>
          </div>
        </>
      ) : (
        <>
          <span className={`card-settings-label ${indented ? 'indented' : ''}`}>
            {label}
          </span>
          <div className="card-settings-control">
            <Form.Item 
              name={formName} 
              noStyle
            >
              <Slider
                min={min}
                max={max}
                step={step}
                marks={sliderMarks}
                disabled={disabled}
                onChange={onChange}
                className="settings-slider"
              />
            </Form.Item>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSettingsRowSlider;
