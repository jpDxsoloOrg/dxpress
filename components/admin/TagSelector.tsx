"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
}

interface TagSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TagSelector({ selectedIds, onChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data: TagItem[]) => setAllTags(data))
      .catch(() => {});
  }, []);

  const toggleTag = useCallback(
    (tagId: string) => {
      if (selectedIds.includes(tagId)) {
        onChange(selectedIds.filter((id) => id !== tagId));
      } else {
        onChange([...selectedIds, tagId]);
      }
    },
    [selectedIds, onChange]
  );

  const createTag = useCallback(async () => {
    if (!newTagName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      const tag: TagItem = await res.json();
      setAllTags((prev) => {
        const exists = prev.some((t) => t.id === tag.id);
        return exists ? prev : [...prev, tag].sort((a, b) => a.name.localeCompare(b.name));
      });
      if (!selectedIds.includes(tag.id)) {
        onChange([...selectedIds, tag.id]);
      }
      setNewTagName("");
    } catch {
      // silently fail
    } finally {
      setCreating(false);
    }
  }, [newTagName, selectedIds, onChange]);

  const selectedTags = allTags.filter((t) => selectedIds.includes(t.id));
  const availableTags = allTags.filter((t) => !selectedIds.includes(t.id));

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Tags
      </label>

      {/* Selected */}
      {selectedTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-700 dark:bg-accent-950 dark:text-accent-300"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="rounded-full p-0.5 hover:bg-accent-200 dark:hover:bg-accent-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available */}
      {availableTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-accent-300 hover:bg-accent-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-accent-700 dark:hover:bg-accent-950"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Create new */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name..."
          className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              createTag();
            }
          }}
        />
        <button
          type="button"
          onClick={createTag}
          disabled={creating || !newTagName.trim()}
          className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}
