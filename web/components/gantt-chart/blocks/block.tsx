import { observer } from "mobx-react";
// hooks
// components
// helpers
import { cn } from "helpers/common.helper";
import { renderFormattedPayloadDate } from "helpers/date-time.helper";
import { useIssueDetail } from "hooks/store";
// types
// constants
import { BLOCK_HEIGHT } from "../constants";
import { ChartAddBlock, ChartDraggable } from "../helpers";
import { useGanttChart } from "../hooks";
import { ChartDataType, IBlockUpdateData, IGanttBlock } from "../types";

type Props = {
  blockId: string;
  getBlockById: (id: string, currentViewData?: ChartDataType | undefined) => IGanttBlock;
  showAllBlocks: boolean;
  blockToRender: (data: any) => React.ReactNode;
  blockUpdateHandler: (block: any, payload: IBlockUpdateData) => void;
  enableBlockLeftResize: boolean;
  enableBlockRightResize: boolean;
  enableBlockMove: boolean;
  enableAddBlock: boolean;
  ganttContainerRef: React.RefObject<HTMLDivElement>;
};

export const GanttChartBlock: React.FC<Props> = observer((props) => {
  const {
    blockId,
    getBlockById,
    showAllBlocks,
    blockToRender,
    blockUpdateHandler,
    enableBlockLeftResize,
    enableBlockRightResize,
    enableBlockMove,
    enableAddBlock,
    ganttContainerRef,
  } = props;
  // store hooks
  const { currentViewData, updateActiveBlockId, isBlockActive } = useGanttChart();
  const { peekIssue } = useIssueDetail();

  const block = getBlockById(blockId, currentViewData);

  // hide the block if it doesn't have start and target dates and showAllBlocks is false
  if (!block || (!showAllBlocks && !(block.start_date && block.target_date))) return null;

  const isBlockVisibleOnChart = block.start_date && block.target_date;

  const handleChartBlockPosition = (
    block: IGanttBlock,
    totalBlockShifts: number,
    dragDirection: "left" | "right" | "move"
  ) => {
    if (!block.start_date || !block.target_date) return;

    const originalStartDate = new Date(block.start_date);
    const updatedStartDate = new Date(originalStartDate);

    const originalTargetDate = new Date(block.target_date);
    const updatedTargetDate = new Date(originalTargetDate);

    // update the start date on left resize
    if (dragDirection === "left") updatedStartDate.setDate(originalStartDate.getDate() - totalBlockShifts);
    // update the target date on right resize
    else if (dragDirection === "right") updatedTargetDate.setDate(originalTargetDate.getDate() + totalBlockShifts);
    // update both the dates on x-axis move
    else if (dragDirection === "move") {
      updatedStartDate.setDate(originalStartDate.getDate() + totalBlockShifts);
      updatedTargetDate.setDate(originalTargetDate.getDate() + totalBlockShifts);
    }

    // call the block update handler with the updated dates
    blockUpdateHandler(block.data, {
      start_date: renderFormattedPayloadDate(updatedStartDate) ?? undefined,
      target_date: renderFormattedPayloadDate(updatedTargetDate) ?? undefined,
    });
  };

  return (
    <div
      className="relative min-w-full w-max"
      style={{
        height: `${BLOCK_HEIGHT}px`,
      }}
    >
      <div
        className={cn("relative h-full", {
          "bg-custom-background-80": isBlockActive(blockId),
          "rounded-l border border-r-0 border-custom-primary-70 hover:border-custom-primary-70":
            peekIssue?.issueId === block.data.id,
        })}
        onMouseEnter={() => updateActiveBlockId(blockId)}
        onMouseLeave={() => updateActiveBlockId(null)}
      >
        {isBlockVisibleOnChart ? (
          <ChartDraggable
            block={block}
            blockToRender={blockToRender}
            handleBlock={(...args) => handleChartBlockPosition(block, ...args)}
            enableBlockLeftResize={enableBlockLeftResize}
            enableBlockRightResize={enableBlockRightResize}
            enableBlockMove={enableBlockMove}
            ganttContainerRef={ganttContainerRef}
          />
        ) : (
          enableAddBlock && <ChartAddBlock block={block} blockUpdateHandler={blockUpdateHandler} />
        )}
      </div>
    </div>
  );
});
