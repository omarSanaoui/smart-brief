import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, Pencil, X, Save } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectTasks, selectTasksLoading } from "../../features/briefs/briefSlice/briefSelectors";
import {
  fetchTasksThunk,
  createTaskThunk,
  updateTaskThunk,
  updateTaskStatusThunk,
  deleteTaskThunk,
} from "../../features/briefs/briefSlice/briefThunk";
import type { Task, TaskPriority, TaskStatus } from "../../features/briefs/briefSlice/briefTypes";
import ConfirmDialog from "../shared/ConfirmDialog";

type Props = {
  briefId: string;
  userRole: string | undefined;
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  HIGH: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  PENDING: "bg-white/5 text-white/50 border-white/10",
  IN_PROGRESS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

type TaskForm = {
  name: string;
  description: string;
  priority: TaskPriority;
  startDate: string;
  endDate: string;
};

const emptyForm = (): TaskForm => ({
  name: "",
  description: "",
  priority: "MEDIUM",
  startDate: "",
  endDate: "",
});

export default function TaskSection({ briefId, userRole }: Props) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const loading = useAppSelector(selectTasksLoading);

  const isAdmin = userRole === "ADMIN";
  const isEmployee = userRole === "EMPLOYEE";

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TaskForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTasksThunk(briefId));
  }, [briefId, dispatch]);

  const completed = tasks.filter(t => t.status === "COMPLETED").length;
  const total = tasks.length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.startDate || !form.endDate) {
      setFormError("All fields are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    if (editingId) {
      await dispatch(updateTaskThunk({ briefId, taskId: editingId, data: form }));
      setEditingId(null);
    } else {
      await dispatch(createTaskThunk({ briefId, ...form }));
    }
    setSaving(false);
    setForm(emptyForm());
    setShowForm(false);
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setForm({
      name: task.name,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate.slice(0, 10),
      endDate: task.endDate.slice(0, 10),
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
  };

  return (
    <section>
      {deleteTarget && (
        <ConfirmDialog
          message="Are you sure you want to delete this task?"
          onConfirm={async () => {
            await dispatch(deleteTaskThunk({ briefId, taskId: deleteTarget }));
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header + progress */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sbpurple font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sbpurple inline-block" />
          Tasks
          {total > 0 && (
            <span className="text-white/30 font-mono normal-case tracking-normal text-[10px]">
              {completed}/{total}
            </span>
          )}
        </h4>
        {isAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sbteal hover:text-white bg-sbteal/10 hover:bg-sbteal px-3 py-1.5 rounded-lg border border-sbteal/20 transition-all"
          >
            <Plus size={12} /> Add Task
          </button>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/30 uppercase tracking-widest">Progress</span>
            <span className="text-[11px] font-black text-white/70">{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100
                  ? "linear-gradient(90deg,#67CFB1,#52a68e)"
                  : "linear-gradient(90deg,#414CC4,#67CFB1)",
              }}
            />
          </div>
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && isAdmin && (
        <div className="mb-5 rounded-2xl border border-[#2E3A5C] bg-[#1a2238] p-5">
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-4">
            {editingId ? "Edit Task" : "New Task"}
          </p>
          {formError && (
            <p className="mb-3 text-rose-400 text-xs">{formError}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Task name"
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sbteal transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Description"
                rows={2}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sbteal transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sbteal transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sbteal transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sbteal transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={cancelForm} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
              <X size={12} /> Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 transition-all">
              <Save size={12} /> {saving ? "Saving..." : editingId ? "Save" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-sbpurple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-[#2E3A5C]/30 rounded-2xl text-white/20 text-xs font-bold uppercase tracking-widest">
          No tasks yet
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              briefId={briefId}
              isAdmin={isAdmin}
              isEmployee={isEmployee}
              onEdit={startEdit}
              onDelete={id => setDeleteTarget(id)}
              dispatch={dispatch}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TaskCard({
  task, briefId, isAdmin, isEmployee, onEdit, onDelete, dispatch,
}: {
  task: Task;
  briefId: string;
  isAdmin: boolean;
  isEmployee: boolean;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  dispatch: ReturnType<typeof useAppDispatch>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border transition-all ${task.status === "COMPLETED" ? "border-emerald-500/20 bg-emerald-500/5" : "border-[#2E3A5C]/60 bg-[#1A2238]/40"}`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === "COMPLETED" ? "bg-emerald-400" : task.status === "IN_PROGRESS" ? "bg-blue-400" : "bg-white/20"}`} />

        <span className={`flex-1 text-sm font-semibold truncate ${task.status === "COMPLETED" ? "line-through text-white/40" : "text-white/90"}`}>
          {task.name}
        </span>

        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>

        {/* Employee status dropdown */}
        {isEmployee && task.status !== "COMPLETED" && (
          <select
            value={task.status}
            onChange={e => dispatch(updateTaskStatusThunk({ briefId, taskId: task.id, status: e.target.value as TaskStatus }))}
            onClick={e => e.stopPropagation()}
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border bg-transparent cursor-pointer focus:outline-none ${STATUS_STYLES[task.status]}`}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        )}

        {!isEmployee && (
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_STYLES[task.status]}`}>
            {task.status.replace("_", " ")}
          </span>
        )}

        {isAdmin && (
          <div className="flex items-center gap-1 ml-1" onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all">
              <Pencil size={12} />
            </button>
            <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        )}

        <ChevronDown size={14} className={`text-white/30 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-[#2E3A5C]/40 pt-3 space-y-2">
          <p className="text-white/60 text-sm leading-relaxed">{task.description}</p>
          <div className="flex gap-4 text-[10px] text-white/30 font-mono">
            <span>Start: {new Date(task.startDate).toLocaleDateString()}</span>
            <span>End: {new Date(task.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
