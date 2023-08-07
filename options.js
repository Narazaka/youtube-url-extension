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

const jinnaiPrefixUrls = [
  { name: "KuronekoServer VRChat Video System", value: "https://kvvs.net/proxy?url=" },
  { name: "YamaPlayer Questユーザ向けの動画再生解決システム", value: "https://api.yamachan.moe/proxy?url=" },
  { name: "YTQ System", value: "https://yt.8uro.net/r?v=" },
  { name: "VRC Video URL Resolve System for Quest", value: "https://qst.akakitune87.net/q?url=" },
  { name: "VRChat Profile video quest", value: "https://vq.vrcprofile.com/?url=" },
  { name: "YT2.QUEST", value: "https://yt2.quest/?url=" },
];

document.addEventListener("DOMContentLoaded", async function () {
  const $prefixUrl = /** @type {HTMLInputElement} */ (
    document.querySelector('[name="prefixUrl"]')
  );
  const $useJinnai = /** @type {HTMLDivElement} */ (
    document.querySelector('.useJinnai')
  );
  const buttons = [];
  for (let i = 0; i < jinnaiPrefixUrls.length; i++) {
    const jinnaiPrefixUrl = jinnaiPrefixUrls[i];
    const $button = document.createElement("button");
    $button.type = "button";
    $button.textContent = `${jinnaiPrefixUrl.name} を使う`;
    $button.style.display = "block";
    $button.addEventListener("click", () => {
      $prefixUrl.value = jinnaiPrefixUrl.value;
      onChangeValue();
    });
    $useJinnai.appendChild($button);
    buttons.push($button);
  }

  const options = await loadOptions();
  $prefixUrl.value = options.prefixUrl;

  function onChangeValue() {
    chrome.storage.local.set({ prefixUrl: $prefixUrl.value });
    for (let i = 0; i < buttons.length; i++) {
      const $button = buttons[i];
      $button.disabled = $prefixUrl.value === jinnaiPrefixUrls[i].value;
    }
  }

  $prefixUrl.addEventListener("input", onChangeValue);
  $prefixUrl.addEventListener("change", onChangeValue);
  onChangeValue();
});
