import {
  QueryClient,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import React, { memo, useEffect } from "react";
import { LuCheck } from "react-icons/lu";
import { TbPlus, TbTrash } from "react-icons/tb";
import Swal from "sweetalert2";
import {
  attendanceTableSettingLanguage,
  attendanceTableUiLanguage,
} from "../../data/languages";
import useClickOutside from "../../hook/useClickOutside";
import {
  AttendanceStatusList,
  AttendanceTable,
  ErrorMessages,
  Language,
} from "../../interfaces";
import {
  useCreateAttendanceStatus,
  useDeleteAttendanceStatus,
  useDeleteAttendanceTable,
  useGetLanguage,
  useUpdateAttendanceStatus,
  useUpdateAttendanceTable,
} from "../../react-query";
import { RequestUpdateAttendanceStatusListService } from "../../services";
import LoadingSpinner from "../common/LoadingSpinner";

type Props = {
  table: AttendanceTable & { statusLists: AttendanceStatusList[] };
  toast: React.RefObject<Toast>;
  onDelete: () => void;
};

// Brand tokens first (success, primary, info, warning, error), then extras.
const PRESET_COLORS = [
  "#27AE60",
  "#2C7CD1",
  "#2E90FA",
  "#FFCD1B",
  "#F79009",
  "#F04438",
  "#EE46BC",
  "#8E7CC3",
  "#383767",
  "#94A3B8",
];

const INPUT =
  "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-icon-color outline-none transition placeholder:text-gray-400 focus:border-primary-color focus:ring-2 focus:ring-primary-color/20 disabled:opacity-60";
// Borderless until hovered/focused, so the list reads as a list, not a form.
const INLINE_INPUT =
  "h-9 rounded-lg border border-transparent bg-transparent px-2 text-sm text-icon-color outline-none transition hover:border-gray-200 focus:border-primary-color focus:bg-white focus:ring-2 focus:ring-primary-color/20 disabled:opacity-60";

const showError = (error: unknown, language: Language) => {
  console.log(error);
  let result = error as ErrorMessages;
  Swal.fire({
    title: result.error
      ? result.error
      : attendanceTableSettingLanguage.somethingWentWrong(language),
    text: result.message.toString(),
    footer: result.statusCode
      ? "Code Error: " + result.statusCode?.toString()
      : "",
    icon: "error",
  });
};

function AttendanceTableSetting({ table, toast, onDelete }: Props) {
  const { data: language = "en" } = useGetLanguage();
  const queryClient = useQueryClient();
  const [tableData, setTableData] = React.useState<
    (AttendanceTable & { statusLists: AttendanceStatusList[] }) | undefined
  >(table);
  const updateTable = useUpdateAttendanceTable();
  const updateStatus = useUpdateAttendanceStatus();
  const deleteAttendanceTable = useDeleteAttendanceTable();

  useEffect(() => {
    setTableData(table);
  }, [table]);

  const isDirty =
    tableData?.title !== table.title ||
    (tableData?.description ?? "") !== (table.description ?? "");

  const handleUpdate = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await updateTable.mutateAsync({
        request: {
          query: {
            attendanceTableId: table.id,
          },
          body: {
            title: tableData?.title,
            description: tableData?.description,
          },
        },
        queryClient,
      });
      toast.current?.show({
        severity: "success",
        summary: attendanceTableSettingLanguage.updated(language),
        detail: attendanceTableSettingLanguage.attendanceTableUpdated(language),
      });
    } catch (error) {
      showError(error, language);
    }
  };

  const handleDeleteAttendanceTable = async ({
    attendanceTableId,
  }: {
    attendanceTableId: string;
  }) => {
    const replacedText = attendanceTableSettingLanguage.delete(language);
    let content = document.createElement("div");
    content.innerHTML =
      "<div>" +
      attendanceTableSettingLanguage.deleteConfirm(language) +
      " <strong>" +
      replacedText +
      "</strong> " +
      attendanceTableSettingLanguage.inTheBoxBelow(language) +
      " </div>";
    const { value } = await Swal.fire({
      title: attendanceTableSettingLanguage.areYouSure(language),
      input: "text",
      icon: "warning",
      footer: attendanceTableSettingLanguage.actionIrreversible(language),
      html: content,
      showCancelButton: true,
      confirmButtonColor: "#F04438",
      inputValidator: (value) => {
        if (value !== replacedText) {
          return attendanceTableSettingLanguage.typeCorrectly(language);
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: attendanceTableSettingLanguage.deleting(language),
          html: attendanceTableSettingLanguage.loading(language),
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await deleteAttendanceTable.mutateAsync({
          request: {
            attendanceTableId,
          },
          queryClient,
        });
        onDelete();
        Swal.close();
        toast.current?.show({
          severity: "success",
          summary: attendanceTableSettingLanguage.deleted(language),
          detail:
            attendanceTableSettingLanguage.attendanceTableDeleted(language),
        });
      } catch (error) {
        showError(error, language);
      }
    }
  };

  const usedColors = (tableData?.statusLists ?? []).map((s) =>
    s.color.toLowerCase(),
  );

  return (
    <div className="flex flex-col gap-8 font-Anuphan text-icon-color">
      {/* GENERAL */}
      <SettingsSection
        title={attendanceTableSettingLanguage.generalSettings(language)}
        description={attendanceTableUiLanguage.generalHint(language)}
      >
        <form
          onSubmit={handleUpdate}
          className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-icon-color/70">
              {attendanceTableSettingLanguage.tableName(language)}
            </span>
            <input
              required
              type="text"
              maxLength={99}
              value={tableData?.title ?? ""}
              onChange={(e) => {
                setTableData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    title: e.target.value,
                  };
                });
              }}
              placeholder={attendanceTableSettingLanguage.tableNamePlaceholder(
                language,
              )}
              className={INPUT}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-icon-color/70">
              {attendanceTableSettingLanguage.description(language)}
            </span>
            <textarea
              required
              rows={2}
              maxLength={99}
              value={tableData?.description ?? ""}
              onChange={(e) => {
                setTableData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    description: e.target.value,
                  };
                });
              }}
              placeholder={attendanceTableSettingLanguage.descriptionPlaceholder(
                language,
              )}
              className={`${INPUT} h-auto resize-none py-2`}
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateTable.isPending || !isDirty}
              className="flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateTable.isPending ? (
                <LoadingSpinner />
              ) : (
                <>
                  <LuCheck />
                  {attendanceTableSettingLanguage.saveChanges(language)}
                </>
              )}
            </button>
          </div>
        </form>
      </SettingsSection>

      {/* STATUSES */}
      <SettingsSection
        title={attendanceTableSettingLanguage.attendanceStatus(language)}
        description={
          <>
            {attendanceTableUiLanguage.statusesHint(language)}
            <span className="mt-2 block">
              {attendanceTableUiLanguage.valueHint(language)}
            </span>
          </>
        }
      >
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-xs font-medium text-gray-500">
            <span className="w-9 shrink-0" />
            <span className="flex-1 px-2">
              {attendanceTableSettingLanguage.name(language)}
            </span>
            <span className="w-20 shrink-0 px-2">
              {attendanceTableSettingLanguage.value(language)}
            </span>
            <span className="flex w-9 shrink-0 justify-center">
              {updateStatus.isPending && (
                <span
                  title={attendanceTableUiLanguage.saving(language)}
                  className="h-3 w-3 animate-spin rounded-full border-2 border-primary-color border-t-transparent"
                />
              )}
            </span>
          </div>
          <ul>
            {tableData?.statusLists.map((status) => (
              <AttendanceStatusRow
                toast={toast}
                updateStatus={updateStatus}
                key={status.id}
                status={status}
              />
            ))}
          </ul>
          <CreateAttendanceStatus
            attendanceTableId={table.id}
            toast={toast}
            defaultColor={
              PRESET_COLORS.find(
                (c) => !usedColors.includes(c.toLowerCase()),
              ) ?? PRESET_COLORS[0]
            }
          />
        </div>
      </SettingsSection>

      {/* DANGER ZONE */}
      <SettingsSection
        title={attendanceTableSettingLanguage.dangerZone(language)}
        description={attendanceTableSettingLanguage.irreversibleAction(
          language,
        )}
      >
        <div className="flex flex-col gap-3 rounded-2xl border border-error-color/30 bg-white p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">
              {attendanceTableSettingLanguage.deleteTable(language)}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {attendanceTableUiLanguage.dangerHint(language)}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleDeleteAttendanceTable({ attendanceTableId: table.id })
            }
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-error-color/40 px-4 text-sm font-semibold text-error-color transition hover:bg-error-color/10"
          >
            <TbTrash />
            {attendanceTableSettingLanguage.deleteTableButton(language)}
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}

export default AttendanceTableSetting;

/* ---------- helpers ---------- */

const SettingsSection: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="grid grid-cols-1 gap-3 md:grid-cols-[15rem_1fr] md:gap-8">
    <div>
      <h2 className="text-base font-semibold text-icon-color">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
    <div className="min-w-0">{children}</div>
  </section>
);

const ColorPicker: React.FC<{
  value: string;
  disabled?: boolean;
  language: Language;
  onChange: (color: string) => void;
  // Fires once per decision (preset click / custom picker closed), so rows
  // don't send a request for every tick while dragging the custom picker.
  onCommit?: (color: string) => void;
}> = ({ value, disabled, language, onChange, onCommit }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={attendanceTableUiLanguage.chooseColor(language)}
        title={attendanceTableUiLanguage.chooseColor(language)}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-background-color disabled:opacity-60"
      >
        <span
          className="h-5 w-5 rounded-full ring-2 ring-white ring-offset-1 ring-offset-gray-200"
          style={{ background: value }}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => {
              const active = color.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    onChange(color);
                    onCommit?.(color);
                    setOpen(false);
                  }}
                  aria-label={color}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-white transition hover:scale-110"
                  style={{ background: color }}
                >
                  {active && <LuCheck />}
                </button>
              );
            })}
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-gray-100 pt-3 text-xs text-icon-color/70">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => onCommit?.(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            {attendanceTableUiLanguage.custom(language)}
            <span className="ml-auto font-mono uppercase text-gray-400">
              {value}
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

const AttendanceStatusRow = memo(
  ({
    status,
    updateStatus,
    toast,
  }: {
    status: AttendanceStatusList;
    toast: React.RefObject<Toast>;
    updateStatus: UseMutationResult<
      AttendanceStatusList,
      Error,
      {
        request: RequestUpdateAttendanceStatusListService;
        queryClient: QueryClient;
      },
      unknown
    >;
  }) => {
    const { data: language = "en" } = useGetLanguage();
    const [data, setData] = React.useState<AttendanceStatusList>(status);
    const queryClient = useQueryClient();
    const deleteStatus = useDeleteAttendanceStatus();
    useEffect(() => {
      setData(status);
    }, [status]);

    // Saves whenever a field differs from the server copy; empty or invalid
    // input snaps back instead of saving.
    const save = async (next: AttendanceStatusList) => {
      if (next.title.trim() === "" || Number.isNaN(next.value)) {
        setData(status);
        return;
      }
      if (
        next.title === status.title &&
        next.color === status.color &&
        next.value === status.value
      ) {
        return;
      }
      try {
        await updateStatus.mutateAsync({
          request: {
            query: {
              id: status.id,
            },
            body: {
              title: next.title,
              color: next.color,
              value: next.value,
            },
          },
          queryClient: queryClient,
        });
      } catch (error) {
        showError(error, language);
      }
    };

    const handleDelete = async () => {
      const confirm = await Swal.fire({
        title: attendanceTableUiLanguage.deleteStatusTitle(language),
        text: attendanceTableUiLanguage.deleteStatusText(language),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: attendanceTableSettingLanguage.delete(language),
        cancelButtonText: attendanceTableUiLanguage.cancel(language),
        confirmButtonColor: "#F04438",
      });
      if (!confirm.isConfirmed) return;
      try {
        await deleteStatus.mutateAsync({
          request: {
            id: status.id,
          },
          queryClient,
        });
        toast.current?.show({
          severity: "success",
          summary: attendanceTableSettingLanguage.deleted(language),
          detail:
            attendanceTableSettingLanguage.attendanceStatusDeleted(language),
        });
      } catch (error) {
        showError(error, language);
      }
    };

    return (
      <li className="group flex items-center gap-2 border-b border-gray-100 px-3 py-1.5">
        <ColorPicker
          value={data.color}
          language={language}
          disabled={updateStatus.isPending}
          onChange={(color) => setData((prev) => ({ ...prev, color }))}
          onCommit={(color) => save({ ...data, color })}
        />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <input
            required
            maxLength={20}
            value={data.title}
            disabled={updateStatus.isPending}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            onBlur={() => save(data)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setData(status);
            }}
            className={`${INLINE_INPUT} min-w-0 flex-1 font-semibold`}
          />
          {status.isHidden && (
            <span className="shrink-0 rounded-full bg-background-color px-2 py-0.5 text-[11px] text-gray-500">
              {attendanceTableUiLanguage.hidden(language)}
            </span>
          )}
        </div>
        <input
          type="number"
          min={0}
          max={10}
          step="any"
          value={Number.isNaN(data.value) ? "" : data.value}
          disabled={updateStatus.isPending}
          onChange={(e) =>
            setData({ ...data, value: parseFloat(e.target.value) })
          }
          onBlur={() => save(data)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className={`${INLINE_INPUT} w-20 shrink-0 tabular-nums`}
        />
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteStatus.isPending}
          aria-label={attendanceTableSettingLanguage.delete(language)}
          title={attendanceTableSettingLanguage.delete(language)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-error-color/10 hover:text-error-color md:opacity-0 md:focus:opacity-100 md:group-hover:opacity-100"
        >
          <TbTrash />
        </button>
      </li>
    );
  },
);
AttendanceStatusRow.displayName = "AttendanceStatusRow";

const CreateAttendanceStatus = memo(
  ({
    toast,
    attendanceTableId,
    defaultColor,
  }: {
    toast: React.RefObject<Toast>;
    attendanceTableId: string;
    defaultColor: string;
  }) => {
    const { data: language = "en" } = useGetLanguage();
    const queryClient = useQueryClient();
    const create = useCreateAttendanceStatus();
    const [createData, setCreateData] = React.useState<{
      title?: string;
      color?: string;
      value?: number;
    }>({
      value: 1,
    });
    const color = createData.color ?? defaultColor;

    const handleCreate = async () => {
      try {
        // 0 is a valid value (e.g. Absent), so only reject missing numbers.
        if (
          !createData.title?.trim() ||
          createData.value === undefined ||
          Number.isNaN(createData.value)
        ) {
          throw new Error(
            attendanceTableSettingLanguage.requiredFields(language),
          );
        }
        await create.mutateAsync({
          request: {
            title: createData.title.trim(),
            color,
            value: createData.value,
            attendanceTableId: attendanceTableId,
          },
          queryClient,
        });
        setCreateData({ value: 1 });
        toast.current?.show({
          severity: "success",
          summary: attendanceTableSettingLanguage.created(language),
          detail:
            attendanceTableSettingLanguage.attendanceStatusCreated(language),
        });
      } catch (error) {
        showError(error, language);
      }
    };

    const onEnter = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCreate();
      }
    };

    return (
      <div className="flex flex-wrap items-center gap-2 rounded-b-2xl bg-background-color/60 px-3 py-2.5">
        <ColorPicker
          value={color}
          language={language}
          onChange={(value) =>
            setCreateData((prev) => ({ ...prev, color: value }))
          }
        />
        <input
          type="text"
          maxLength={20}
          value={createData.title ?? ""}
          onChange={(e) =>
            setCreateData((prev) => ({ ...prev, title: e.target.value }))
          }
          onKeyDown={onEnter}
          placeholder={attendanceTableUiLanguage.newStatusPlaceholder(language)}
          className={`${INPUT} min-w-0 flex-1`}
        />
        <input
          type="number"
          min={0}
          max={10}
          step="any"
          value={
            createData.value === undefined || Number.isNaN(createData.value)
              ? ""
              : createData.value
          }
          onChange={(e) =>
            setCreateData((prev) => ({
              ...prev,
              value: parseFloat(e.target.value),
            }))
          }
          onKeyDown={onEnter}
          className={`${INPUT} w-20 shrink-0 tabular-nums`}
        />
        <button
          type="button"
          disabled={create.isPending || !createData.title?.trim()}
          onClick={handleCreate}
          className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary-color px-3 text-sm font-semibold text-white transition hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {create.isPending ? (
            <LoadingSpinner />
          ) : (
            <>
              <TbPlus />
              {attendanceTableUiLanguage.addStatus(language)}
            </>
          )}
        </button>
      </div>
    );
  },
);
CreateAttendanceStatus.displayName = "CreateAttendanceStatus";
