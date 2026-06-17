import React from "react";
import { motion } from "framer-motion";
import { IdeaList } from "./planner/IdeaList";
import { IdeaEditor } from "./planner/IdeaEditor";

export function PlannerTab() {
  return (
    <motion.div
      key="planner"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch h-full"
    >
      <IdeaList />
      <IdeaEditor />
    </motion.div>
  );
}
