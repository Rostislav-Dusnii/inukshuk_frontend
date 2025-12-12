import React, { useState } from "react";
import { HintInputDto } from "@types";

interface AddHintFormProps {
  onAdd: (input: HintInputDto) => void;
}

const AddHintForm: React.FC<AddHintFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>(
    {}
  );

  const validate = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    } else if (title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.length < 5) {
      newErrors.content = "Content must be at least 5 characters long";
    } else if (content.length > 500) {
      newErrors.content = "Content cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onAdd({ title, content });
    setTitle("");
    setContent("");
    setErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border border-brand-green-light rounded-md bg-white dark:bg-gray-900 dark:border-gray-700"
    >
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
        <span className="text-brand-orange-dark ">ADD </span>
        <span className="text-brand-green-dark ">NEW </span>
        <span className="text-gray-800 dark:text-white">HINT</span>
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          required
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          required
        />
        {errors.content && (
          <p className="text-red-600 text-sm mt-1">{errors.content}</p>
        )}
      </div>

      <button
        type="submit"
        className="bg-brand-green-light border border-brand-green-light text-white px-4 py-2 rounded-md hover:bg-brand-green-dark dark:bg-brand-green-dark dark:border-brand-green-dark dark:hover:bg-brand-green-light"
      >
        Add Hint
      </button>
    </form>
  );
};

export default AddHintForm;
