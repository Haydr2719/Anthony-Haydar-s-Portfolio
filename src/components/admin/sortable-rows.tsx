"use client";

import { useOptimistic, useTransition } from "react";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderRecords } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { ListActions } from "./list-actions";

export interface SortableRow {
  id: string;
  /** The row's table cells (rendered on the server). */
  cells: React.ReactNode;
}

/** Rows only move up and down. */
const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

/**
 * Admin list rows that can be reordered by dragging the handle (mouse, touch, or
 * keyboard: focus the handle, Space, arrow keys, Space). The new order shows
 * immediately and is saved in one request; if saving fails the list snaps back.
 * The up / down / delete buttons stay available on every row.
 */
export function SortableRows({ collection, rows, canDelete }: { collection: string; rows: SortableRow[]; canDelete?: boolean }) {
  const [, startTransition] = useTransition();
  // Order shown on screen: the dropped order while it saves, then the server's order.
  const [order, setOrder] = useOptimistic(rows.map((r) => r.id));
  const [savingId, setSavingId] = useOptimistic<string | null>(null);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const visible = order.map((id) => byId.get(id)).filter((r): r is SortableRow => Boolean(r));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), // a click on the handle isn't a drag
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const next = arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id)));
    startTransition(async () => {
      setOrder(next);
      setSavingId(String(active.id));
      const res = await reorderRecords(collection, next);
      // Failure: the optimistic order is dropped when the transition ends -> list snaps back.
      if (!res.ok) alert(res.error ?? "Could not save the new order");
    });
  };

  return (
    // A fixed id keeps dnd-kit's accessibility ids identical on server and client.
    <DndContext id={`sortable-${collection}`} sensors={sensors} collisionDetection={closestCenter} modifiers={[verticalOnly]} onDragEnd={onDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <tbody>
          {visible.map((row, i) => (
            <SortableTableRow key={row.id} row={row} saving={savingId === row.id}>
              <td className="px-4 py-3">
                <ListActions collection={collection} id={row.id} sortable canDelete={canDelete} first={i === 0} last={i === visible.length - 1} />
              </td>
            </SortableTableRow>
          ))}
        </tbody>
      </SortableContext>
    </DndContext>
  );
}

function SortableTableRow({ row, saving, children }: { row: SortableRow; saving: boolean; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-pending={saving ? "" : undefined}
      className={cn(
        "border-b border-stone/70 transition-opacity last:border-0 hover:bg-paper/60 has-data-pending:pointer-events-none has-data-pending:opacity-50 data-pending:pointer-events-none data-pending:opacity-50",
        isDragging && "relative z-10 bg-white shadow-[0_12px_30px_-12px_rgba(31,31,29,0.45)]",
      )}
    >
      <td className="w-px py-3 pl-3 pr-0">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="flex size-8 cursor-grab touch-none items-center justify-center rounded text-muted hover:bg-paper-2 hover:text-ink active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      {row.cells}
      {children}
    </tr>
  );
}
