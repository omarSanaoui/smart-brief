import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, Pencil, X, Save, Calendar } from "lucide-react";
import { DatePicker, Portal, Select, createListCollection } from "@chakra-ui/react";
import { parseDate } from "@internationalized/date";
import { getLocalTimeZone } from "@internationalized/date";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectTasks, selectTasksLoading } from "../../features/briefs/briefSlice/briefSelectors";
import { fetchTasksThunk, createTaskThunk, updateTaskThunk, updateTaskStatusThunk, deleteTaskThunk } from "../../features/briefs/briefSlice/briefThunk";
import type { Task, TaskPriority, TaskStatus } from "../../features/briefs/briefSlice/briefTypes";
import ConfirmDialog from "../shared/ConfirmDialog";
import { useTranslation } from "react-i18next";

type Props = { briefId: string; userRole: string | undefined };

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

const priorityCollection = createListCollection({
  items: [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ],
});

const statusCollection = createListCollection({
  items: [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
  ],
});

type TaskForm = { name: string; description: string; priority: TaskPriority; startDate: string; endDate: string };
const emptyForm = (): TaskForm => ({ name: "", description: "", priority: "MEDIUM", startDate: "", endDate: "" });

const toDateValue = (s: string) => {
  try { return s ? [parseDate(s)] : []; }
  catch { return []; }
};

export default function TaskSection({ briefId, userRole }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const tasks = useAppSelector(selectTasks);
  const loading = useAppSelector(selectTasksLoading);
  const timeZone = getLocalTimeZone();

  const isAdmin = userRole === "ADMIN";
  const isEmployee = userRole === "EMPLOYEE";

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TaskForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchTasksThunk(briefId)); }, [briefId, dispatch]);

  const completed = tasks.filter(t => t.status === "COMPLETED").length;
  const total = tasks.length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.startDate || !form.endDate) {
      setFormError(t("taskSection.allFieldsRequired"));
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
    setForm({ name: task.name, description: task.description, priority: task.priority, startDate: task.startDate.slice(0, 10), endDate: task.endDate.slice(0, 10) });
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm()); setFormError(null); };

  return (
    <section>
      {deleteTarget && (
        <ConfirmDialog
          message={t("taskSection.deleteConfirm")}
          onConfirm={async () => { await dispatch(deleteTaskThunk({ briefId, taskId: deleteTarget })); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sbpurple font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sbpurple inline-block" />
          {t("taskSection.tasks")}
          {total > 0 && <span className="text-white/30 font-mono normal-case tracking-normal text-[10px]">{completed}/{total}</span>}
        </h4>
        {isAdmin && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sbteal hover:text-white bg-sbteal/10 hover:bg-sbteal px-3 py-1.5 rounded-lg border border-sbteal/20 transition-all">
            <Plus size={12} /> {t("taskSection.addTask")}
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/30 uppercase tracking-widest">{t("taskSection.progress")}</span>
            <span className="text-[11px] font-black text-white/70">{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#67CFB1,#52a68e)" : "linear-gradient(90deg,#414CC4,#67CFB1)" }} />
          </div>
        </div>
      )}

      {showForm && isAdmin && (
        <div className="mb-5 rounded-2xl border border-[#2E3A5C] bg-[#1a2238] p-5">
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-4">
            {editingId ? t("taskSection.editTask") : t("taskSection.newTask")}
          </p>
          {formError && <p className="mb-3 text-rose-400 text-xs">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder={t("taskSection.taskName")}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sbteal transition-colors" />
            </div>
            <div className="sm:col-span-3">
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder={t("taskSection.description")} rows={2}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-lg px-3 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sbteal transition-colors resize-none" />
            </div>

            <div>
              <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">{t("taskSection.priority")}</label>
              <Select.Root collection={priorityCollection} value={[form.priority]}
                onValueChange={({ value }) => setForm(p => ({ ...p, priority: value[0] as TaskPriority }))}
                positioning={{ placement: "bottom-start", sameWidth: true }}>
                <Select.HiddenSelect />
                <Select.Control className="ts-sel-control w-full rounded-lg border border-[#2E3A5C] bg-[#2D3652]">
                  <Select.Trigger className="ts-sel-trigger flex w-full items-center justify-between px-3 py-2.5 text-sm text-white focus:outline-none">
                    <Select.ValueText className="text-sm text-white" />
                    <Select.Indicator><ChevronDown size={13} className="text-white/40" /></Select.Indicator>
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content className="ts-sel-content z-[9999] rounded-lg border border-[#2E3A5C] py-1 shadow-2xl">
                      {priorityCollection.items.map(item => (
                        <Select.Item key={item.value} item={item} className="ts-sel-item flex cursor-pointer items-center px-3 py-2 text-sm text-white transition-colors">
                          <Select.ItemText>{item.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </div>

            <div>
              <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">{t("taskSection.startDate")}</label>
              <DatePicker.Root value={toDateValue(form.startDate)}
                onValueChange={({ value }) => setForm(p => ({ ...p, startDate: value[0]?.toString() ?? "" }))}
                closeOnSelect positioning={{ placement: "top-start" }}>
                <DatePicker.Control className="ts-dp-control flex w-full items-center rounded-lg border border-[#2E3A5C] bg-[#2D3652]">
                  <DatePicker.Input placeholder="Start date" className="ts-dp-input w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none" />
                  <DatePicker.IndicatorGroup className="pr-2">
                    <DatePicker.Trigger className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:bg-white/5 hover:text-white transition-colors">
                      <Calendar className="w-3.5 h-3.5" />
                    </DatePicker.Trigger>
                  </DatePicker.IndicatorGroup>
                </DatePicker.Control>
                <Portal>
                  <DatePicker.Positioner>
                    <DatePicker.Content className="ts-dp-popup z-[9999] rounded-xl border border-[#2E3A5C] bg-[#1a2238] p-3 text-white shadow-2xl">
                      <DatePicker.View view="day" className="w-[320px]"><DatePicker.Header className="mb-2" /><DatePicker.DayTable /></DatePicker.View>
                      <DatePicker.View view="month" className="w-[320px]"><DatePicker.Header className="mb-2" /><DatePicker.MonthTable /></DatePicker.View>
                      <DatePicker.View view="year" className="w-[320px]"><DatePicker.Header className="mb-2" /><DatePicker.YearTable /></DatePicker.View>
                    </DatePicker.Content>
                  </DatePicker.Positioner>
                </Portal>
              </DatePicker.Root>
            </div>

            <div>
              <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">{t("taskSection.endDate")}</label>
              <DatePicker.Root value={toDateValue(form.endDate)}
                onValueChange={({ value }) => setForm(p => ({ ...p, endDate: value[0]?.toString() ?? "" }))}
                closeOnSelect positioning={{ placement: "top-start" }}>
                <DatePicker.Control className="ts-dp-control flex w-full items-center rounded-lg border border-[#2E3A5C] bg-[#2D3652]">
                  <DatePicker.Input placeholder="End date" className="ts-dp-input w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none" />
                  <DatePicker.IndicatorGroup className="pr-2">
                    <DatePicker.Trigger className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:bg-white/5 hover:text-white transition-colors">
                      <Calendar className="w-3.5 h-3.5" />
                    </DatePicker.Trigger>
                  </DatePicker.IndicatorGroup>
                </DatePicker.Control>
                <Portal>
                  <DatePicker.Positioner>
                    <DatePicker.Content className="ts-dp-popup z-[9999] rounded-xl border border-[#2E3A5C] bg-[#1a2238] p-3 text-white shadow-2xl">
                      <DatePicker.View view="day" className="w-[320px]"><DatePicker.Header className="mb-2" /><DatePicker.DayTable /></DatePicker.View>
                      <DatePicker.View view="month" className="w-[320px]"><DatePicker.Header className="mb-2" /><DatePicker.MonthTable /></DatePicker.View>
                      <DatePicker.View view="year" className="w-[320px]"><DatePicker.Header className="mb-2" /><DatePicker.YearTable /></DatePicker.View>
                    </DatePicker.Content>
                  </DatePicker.Positioner>
                </Portal>
              </DatePicker.Root>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={cancelForm} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
              <X size={12} /> {t("taskSection.cancel")}
            </button>
            <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 transition-all">
              <Save size={12} /> {saving ? t("taskSection.saving") : editingId ? t("taskSection.save") : t("taskSection.create")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-sbpurple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-[#2E3A5C]/30 rounded-2xl text-white/20 text-xs font-bold uppercase tracking-widest">
          {t("taskSection.noTasks")}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} briefId={briefId} isAdmin={isAdmin} isEmployee={isEmployee}
              onEdit={startEdit} onDelete={id => setDeleteTarget(id)} dispatch={dispatch} timeZone={timeZone} />
          ))}
        </div>
      )}

      <style>{`
        .ts-sel-control { border-color: #2E3A5C !important; box-shadow: none !important; }
        .ts-sel-trigger:focus, .ts-sel-trigger:focus-visible { outline: none !important; box-shadow: none !important; }
        .ts-sel-control:focus-within { border-color: #67CFB1 !important; box-shadow: 0 0 0 1px #67CFB1 !important; }
        .ts-sel-content { background-color: #1e2a42 !important; border: 1px solid #2E3A5C !important; }
        .ts-sel-item { color: white !important; background-color: transparent !important; }
        .ts-sel-item:hover, .ts-sel-item[data-highlighted] { background-color: #414CC4 !important; color: white !important; }
        .ts-sel-item[data-selected] { background-color: rgba(65,76,196,0.75) !important; color: white !important; }
        .ts-status-control { border-color: transparent !important; box-shadow: none !important; background: transparent !important; }
        .ts-status-trigger:focus, .ts-status-trigger:focus-visible { outline: none !important; box-shadow: none !important; }
        .ts-dp-control { border-color: #2E3A5C !important; box-shadow: none !important; }
        .ts-dp-control:focus-within { border-color: #67CFB1 !important; box-shadow: 0 0 0 1px #67CFB1 !important; }
        .ts-dp-input { color: white !important; caret-color: white; border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; }
        .ts-dp-input::placeholder { color: rgba(255,255,255,0.3) !important; }
        .ts-dp-input:hover, .ts-dp-input:focus, .ts-dp-input:focus-visible { border: none !important; outline: none !important; box-shadow: none !important; }
        .ts-dp-popup { min-width: 344px; border-radius: 14px; border: 1px solid #2E3A5C; background: #1A2238; box-shadow: 0 24px 60px rgba(0,0,0,0.42); }
        .ts-dp-popup [data-part="view-control"] { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
        .ts-dp-popup [data-part="prev-trigger"], .ts-dp-popup [data-part="next-trigger"], .ts-dp-popup [data-part="view-trigger"] { border-radius: 8px; color: white !important; transition: background-color 0.2s; }
        .ts-dp-popup [data-part="prev-trigger"]:hover, .ts-dp-popup [data-part="next-trigger"]:hover, .ts-dp-popup [data-part="view-trigger"]:hover { background: rgba(255,255,255,0.08); }
        .ts-dp-popup [data-part="table"] { width: 100%; border-collapse: separate; border-spacing: 4px; }
        .ts-dp-popup [data-part="table-header"] { color: rgba(255,255,255,0.45) !important; font-size: 11px; font-weight: 500; text-align: center; padding-bottom: 4px; }
        .ts-dp-popup [data-part="table-cell-trigger"] { height: 32px; border: none !important; outline: none !important; border-radius: 8px; color: white !important; font-size: 12px; transition: background-color 0.2s; }
        .ts-dp-popup [data-part="table-cell-trigger"]:hover { background: rgba(103,207,177,0.18); }
        .ts-dp-popup [data-part="table-cell-trigger"][data-selected] { background: #414CC4; color: white !important; }
        .ts-dp-popup [data-part="table-cell-trigger"][data-today] { box-shadow: inset 0 0 0 1px rgba(103,207,177,0.55); }
        .ts-dp-popup [data-part="table-cell-trigger"][data-outside-range], .ts-dp-popup [data-part="table-cell-trigger"][data-disabled] { color: rgba(255,255,255,0.28) !important; }
        .ts-dp-popup button:focus, .ts-dp-popup button:focus-visible, .ts-dp-popup [data-part="table-cell-trigger"]:focus, .ts-dp-popup [data-part="table-cell-trigger"]:focus-visible { outline: none !important; box-shadow: none; }
        .ts-dp-popup select, .ts-dp-popup button, .ts-dp-popup th, .ts-dp-popup td, .ts-dp-popup span, .ts-dp-popup div { color: inherit; }
      `}</style>
    </section>
  );
}

function TaskCard({ task, briefId, isAdmin, isEmployee, onEdit, onDelete, dispatch }: {
  task: Task; briefId: string; isAdmin: boolean; isEmployee: boolean;
  onEdit: (t: Task) => void; onDelete: (id: string) => void;
  dispatch: ReturnType<typeof useAppDispatch>; timeZone: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border transition-all ${task.status === "COMPLETED" ? "border-emerald-500/20 bg-emerald-500/5" : "border-[#2E3A5C]/60 bg-[#1A2238]/40"}`}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === "COMPLETED" ? "bg-emerald-400" : task.status === "IN_PROGRESS" ? "bg-blue-400" : "bg-white/20"}`} />
        <span className={`flex-1 text-sm font-semibold truncate ${task.status === "COMPLETED" ? "line-through text-white/40" : "text-white/90"}`}>{task.name}</span>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>

        {isEmployee && task.status !== "COMPLETED" && (
          <div onClick={e => e.stopPropagation()}>
            <Select.Root collection={statusCollection} value={[task.status]}
              onValueChange={({ value }) => dispatch(updateTaskStatusThunk({ briefId, taskId: task.id, status: value[0] as TaskStatus }))}
              positioning={{ placement: "bottom-end", sameWidth: false }}>
              <Select.HiddenSelect />
              <Select.Control className={`ts-status-control rounded-lg border px-0 ${STATUS_STYLES[task.status]}`}>
                <Select.Trigger className="ts-status-trigger flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest focus:outline-none">
                  <Select.ValueText className="text-[10px] font-bold uppercase tracking-widest" />
                  <Select.Indicator><ChevronDown size={10} /></Select.Indicator>
                </Select.Trigger>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content className="ts-sel-content z-[9999] rounded-lg border border-[#2E3A5C] py-1 shadow-2xl min-w-[130px]">
                    {statusCollection.items.map(item => (
                      <Select.Item key={item.value} item={item} className="ts-sel-item flex cursor-pointer items-center px-3 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors">
                        <Select.ItemText>{item.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </div>
        )}

        {!isEmployee && (
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[task.status]}`}>
            {task.status.replace("_", " ")}
          </span>
        )}

        {isAdmin && (
          <div className="flex items-center gap-1 ml-1" onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"><Pencil size={12} /></button>
            <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={12} /></button>
          </div>
        )}

        <ChevronDown size={14} className={`text-white/30 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-[#2E3A5C]/40 pt-3 space-y-2">
          <p className="text-white/60 text-sm leading-relaxed">{task.description}</p>
          <div className="flex gap-4 text-[10px] text-white/30 font-mono">
            <span>{t("taskSection.start")} {new Date(task.startDate).toLocaleDateString()}</span>
            <span>{t("taskSection.end")} {new Date(task.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
