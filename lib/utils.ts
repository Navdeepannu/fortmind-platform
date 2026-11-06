import { createCn } from "cn/config";

// Register the shared type scale so font-size classes never replace semantic ink.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["page-title", "section-title", "panel-title", "body", "label", "caption", "metric"] },
      ],
    },
  },
});
