// @ts-check

/**
 *
 * @returns {Promise<Options>}
 */
async function loadOptions() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      {
        prefixUrl: "",
      },
      (optionsArg) => resolve(/** @type {Options} */ (optionsArg)),
    );
  });
}

const jinnaiPrefixUrl = "https://vrc.kuroneko6423.com/proxy?url=";

document.addEventListener("DOMContentLoaded", async function () {
  const $prefixUrl = /** @type {HTMLInputElement} */ (
    document.querySelector('[name="prefixUrl"]')
  );
  const $useJinnai = /** @type {HTMLButtonElement} */ (
    document.querySelector('[name="useJinnai"]')
  );

  const options = await loadOptions();
  $prefixUrl.value = options.prefixUrl;

  function onChangeValue() {
    chrome.storage.local.set({ prefixUrl: $prefixUrl.value });
    $useJinnai.disabled = $prefixUrl.value === jinnaiPrefixUrl;
  }

  $useJinnai.addEventListener("click", () => {
    $prefixUrl.value = jinnaiPrefixUrl;
    onChangeValue();
  });
  $prefixUrl.addEventListener("input", onChangeValue);
  $prefixUrl.addEventListener("change", onChangeValue);
  onChangeValue();
});
