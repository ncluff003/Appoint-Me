import * as Utility from './../../Application/Utility';

export const watchSetting = (budget) => {
  const emergencyLabels = document.querySelectorAll('.emergency-checkbox-label');
  const emergencyInputs = document.querySelectorAll('.emergency-input');
  emergencyLabels.forEach((label) =>
    label.addEventListener(`click`, (e) => {
      e.preventDefault();
      emergencyLabels.forEach((label) => Utility.removeClasses(label, [`clicked-label`]));
      Utility.addClasses(label, [`clicked-label`]);
      if (label.textContent === `Length Of Time`) {
        Utility.replaceClassName(emergencyInputs[1], `closed`, `open`);
        Utility.replaceClassName(emergencyInputs[0], `open`, `closed`);
        budget.updateEmergencyMeasurement({ setting: label.textContent });
      } else {
        Utility.replaceClassName(emergencyInputs[0], `closed`, `open`);
        Utility.replaceClassName(emergencyInputs[1], `open`, `closed`);
        budget.updateEmergencyMeasurement({ setting: label.textContent });
      }
    })
  );
};
