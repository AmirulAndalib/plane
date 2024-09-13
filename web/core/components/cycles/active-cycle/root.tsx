"use client";

import { observer } from "mobx-react";
import { Disclosure } from "@headlessui/react";
// ui
import { Row } from "@plane/ui";
// components
import {
  ActiveCycleProductivity,
  ActiveCycleProgress,
  ActiveCycleStats,
  CycleListGroupHeader,
  CyclesListItem,
} from "@/components/cycles";
import { EmptyState } from "@/components/empty-state";
// constants
import { EmptyStateType } from "@/constants/empty-state";
import { useCycle } from "@/hooks/store";
import { ActiveCycleIssueDetails } from "@/store/issue/cycle";
import useCyclesDetails from "./use-cycles-details";
import { CycleProgressHeader } from "./progress-header";
import ActiveCycleChart from "./cycle-chart/chart";
import { useState } from "react";
import Summary from "./summary";
import Selection from "./selection";

interface IActiveCycleDetails {
  workspaceSlug: string;
  projectId: string;
}

export const ActiveCycleRoot: React.FC<IActiveCycleDetails> = observer((props) => {
  const { workspaceSlug, projectId } = props;
  const { currentProjectActiveCycle, currentProjectActiveCycleId } = useCycle();
  const {
    handleFiltersUpdate,
    cycle: activeCycle,
    cycleIssueDetails,
  } = useCyclesDetails({ workspaceSlug, projectId, cycleId: currentProjectActiveCycleId });
  const [areaToHighlight, setAreaToHighlight] = useState<string>("");
  if (!activeCycle) return null;
  return (
    <>
      <Disclosure as="div" className="flex flex-shrink-0 flex-col" defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="sticky top-0 z-[2] w-full flex-shrink-0 border-b border-custom-border-200 bg-custom-background-90 cursor-pointer">
              <CycleProgressHeader cycleDetails={activeCycle} />
            </Disclosure.Button>
            <Disclosure.Panel>
              {!currentProjectActiveCycle ? (
                <EmptyState type={EmptyStateType.PROJECT_CYCLE_ACTIVE} size="sm" />
              ) : (
                <div className="flex flex-col border-b border-custom-border-200">
                  <Row className="flex bg-custom-background-100 h-[420px] justify-between !pr-0">
                    <Summary setAreaToHighlight={setAreaToHighlight} />
                    <div className="h-full w-full flex-1">
                      <Selection />
                      <ActiveCycleChart areaToHighlight={areaToHighlight} />
                    </div>
                  </Row>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </>
  );
});
