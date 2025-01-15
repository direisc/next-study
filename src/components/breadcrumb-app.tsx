import React from "react"
import {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Breadcrumb,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function BreadcrumbApp({
  breadcrumb,
}: {
  breadcrumb: { item: string; url?: string }[]
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {breadcrumb?.length ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb.map(({ item, url = "#" }, i) => (
                <React.Fragment key={`breadcrumb_${i}`}>
                  {i < breadcrumb.length - 1 ? (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={url}>{item}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  ) : (
                    <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
      </div>
    </header>
  )
}
