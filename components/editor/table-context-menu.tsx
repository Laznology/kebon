"use client";

import React, { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { Plus, Trash2, Minus } from "lucide-react";

interface TableContextMenuProps {
  editor: Editor;
}

interface MenuPosition {
  x: number;
  y: number;
}

export function TableContextMenu({ editor }: TableContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (!editor) return;

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tableCell = target.closest("td, th");
      const table = target.closest("table");

      if (table && tableCell && editor.isActive("table")) {
        event.preventDefault();

        const menuWidth = 192;
        const menuHeight = 280;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = event.clientX;
        let y = event.clientY;

        if (x + menuWidth > viewportWidth) {
          x = viewportWidth - menuWidth - 10;
        }

        if (y + menuHeight > viewportHeight) {
          y = viewportHeight - menuHeight - 10;
        }

        setPosition({ x, y });
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVisible(false);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  if (!isVisible) {
    return null;
  }

  const menuItems = [
    {
      label: "Add row above",
      icon: <Plus size={14} />,
      action: () => {
        editor.chain().focus().addRowBefore().run();
        setIsVisible(false);
      },
    },
    {
      label: "Add row below",
      icon: <Plus size={14} />,
      action: () => {
        editor.chain().focus().addRowAfter().run();
        setIsVisible(false);
      },
    },
    {
      label: "Delete row",
      icon: <Minus size={14} />,
      action: () => {
        editor.chain().focus().deleteRow().run();
        setIsVisible(false);
      },
      destructive: true,
    },
    { type: "separator" },
    {
      label: "Add column left",
      icon: <Plus size={14} />,
      action: () => {
        editor.chain().focus().addColumnBefore().run();
        setIsVisible(false);
      },
    },
    {
      label: "Add column right",
      icon: <Plus size={14} />,
      action: () => {
        editor.chain().focus().addColumnAfter().run();
        setIsVisible(false);
      },
    },
    {
      label: "Delete column",
      icon: <Minus size={14} />,
      action: () => {
        editor.chain().focus().deleteColumn().run();
        setIsVisible(false);
      },
      destructive: true,
    },
    { type: "separator" },
    {
      label: "Delete table",
      icon: <Trash2 size={14} />,
      action: () => {
        editor.chain().focus().deleteTable().run();
        setIsVisible(false);
      },
      destructive: true,
    },
  ];

  return (
    <div
      data-table-context-menu
      className="fixed z-50 min-w-48 bg-[rgb(var(--background))] border border-border rounded-lg shadow-lg py-1"
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) => {
        if (item.type === "separator") {
          return (
            <div
              key={`separator-${index}`}
              className="h-px bg-border my-1 mx-2"
            />
          );
        }

        return (
          <button
            key={item.label}
            onClick={item.action}
            className={`
              w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground 
              flex items-center gap-3 transition-colors
              ${item.destructive ? "text-destructive hover:text-destructive" : ""}
            `}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
