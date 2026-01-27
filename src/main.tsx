import confetti from "canvas-confetti";
import { setupL10N } from "./libs/l10n";
import { BlockProperty, DbId } from "./orca";
import zhCN from "./translations/zhCN";

let pluginName: string;
let afterTaskCommandHook: any = null;

function createFireworks() {
  const duration = 500; // Run for 500ms
  const end = Date.now() + duration;

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFE66D",
    "#95E1D3",
    "#F38181",
    "#AA96DA",
  ];

  function frame() {
    // Launch confetti from left side
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.45 },
      colors,
      disableForReducedMotion: true,
      zIndex: 9999,
    });

    // Launch confetti from right side
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.45 },
      colors,
      disableForReducedMotion: true,
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }

  frame();
}

function isTaskCompleted(properties: BlockProperty[]): boolean {
  const repr = properties.find((p) => p.name === "_repr")?.value;
  if (!repr) return false;
  return repr.type === "task" && repr.state === 1;
}

export async function load(_name: string) {
  pluginName = _name;

  setupL10N(orca.state.locale, { "zh-CN": zhCN });

  // Register after hook for setProperties command
  afterTaskCommandHook = async (
    cmdId: string,
    blockId: DbId,
    properties: BlockProperty[],
  ) => {
    // Check if this is a task completion
    if (isTaskCompleted(properties)) {
      // Trigger fireworks
      createFireworks();
    }
  };
  orca.commands.registerAfterCommand(
    "core.editor.setProperties",
    afterTaskCommandHook,
  );

  console.log(`${pluginName} loaded.`);
}

export async function unload() {
  // Remove the command hook
  if (afterTaskCommandHook) {
    orca.commands.unregisterAfterCommand(
      "core.editor.setProperties",
      afterTaskCommandHook,
    );
    afterTaskCommandHook = null;
  }

  // Reset confetti
  confetti.reset();

  console.log(`${pluginName} unloaded.`);
}
