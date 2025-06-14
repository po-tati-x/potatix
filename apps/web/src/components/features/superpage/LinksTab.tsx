import { LinkIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { LinksTabProps } from "./types";
import { LinkEditor } from "./LinkEditor";

export function LinksTab({
  links,
  iconOptions,
  onAddLink,
  onLinkChange,
  onDeleteLink,
  onDragEnd,
}: LinksTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium text-slate-900">Your Links</h2>
        <Button
          type="outline"
          size="small"
          icon={<PlusCircle className="h-3.5 w-3.5" />}
          onClick={onAddLink}
        >
          Add Link
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="links">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {links.map((link, index) => (
                <Draggable key={link.id} draggableId={link.id} index={index}>
                  {(provided, snapshot) => (
                    <LinkEditor
                      link={link}
                      iconOptions={iconOptions}
                      onLinkChange={onLinkChange}
                      onDeleteLink={onDeleteLink}
                      provided={provided}
                      isDragging={snapshot.isDragging}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {links.length === 0 && (
        <div className="text-center py-12 border border-dashed border-slate-300 rounded-md bg-slate-50">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-4">
            <LinkIcon className="h-5 w-5 text-slate-500" />
          </div>

          <h3 className="text-sm font-medium text-slate-900 mb-2">
            No links yet
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Add links to your important resources, social profiles, and more.
          </p>

          <Button
            type="primary"
            size="small"
            icon={<PlusCircle className="h-3.5 w-3.5" />}
            onClick={onAddLink}
          >
            Add Your First Link
          </Button>
        </div>
      )}
    </div>
  );
}
