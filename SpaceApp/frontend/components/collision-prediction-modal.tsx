"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Share2,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { type CollisionAlert } from "@/lib/collision-service"

export function CollisionPredictionModal({ collision, buttonVariant = "outline", buttonClassName = "" }: { collision: CollisionAlert, buttonVariant?: "default" | "link" | "destructive" | "outline" | "secondary" | "ghost", buttonClassName?: string }) {
  const [open, setOpen] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(collision, null, 2))
    toast({
      title: "Copied to clipboard",
      description: "Collision data has been copied to your clipboard",
    })
  }

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Collision report is being downloaded",
    })
  }

  const handleShare = () => {
    toast({
      title: "Share link created",
      description: "A shareable link has been copied to your clipboard",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size="sm" className={buttonClassName}>
          {buttonVariant === "default" ? (
            "View Details"
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Details</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                collision.danger_level === "CRITICAL"
                  ? "destructive"
                  : collision.danger_level === "HIGH"
                    ? "secondary"
                    : "outline"
              }
              className={collision.danger_level === "CRITICAL" ? "animate-pulse" : ""}
            >
              {collision.danger_level} Risk
            </Badge>
            <DialogTitle>Collision Prediction Details</DialogTitle>
          </div>
          <DialogDescription>Detailed analysis and visualization of the potential collision event</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Primary Object</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">{collision.satellites[0]}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Position:</span> {collision.position1_km.join(', ')} km
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Secondary Object</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">{collision.satellites[1]}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Position:</span> {collision.position2_km.join(', ')} km
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conjunction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Time to Closest Approach</div>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">{collision.time}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Miss Distance</div>
                    <div className="flex items-center mt-1">
                      <ArrowRight className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">{collision.distance_km.toFixed(2)} km</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Trend</div>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">{collision.trend}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Distance Trend</div>
                    <div className="flex items-center mt-1">
                      <TrendingDown className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">{collision.distance_trend}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="text-sm font-medium">Distance History</div>
                  <div className="h-20 bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Past</span>
                      <span>Present</span>
                      <span>Future</span>
                    </div>
                    <div className="h-12 mt-1">
                      <div className="flex items-end h-full gap-1">
                        {collision.distance_history_km.map((distance, index) => (
                          <div
                            key={index}
                            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                            style={{
                              height: `${(distance / Math.max(...collision.distance_history_km)) * 100}%`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualization" className="pt-4">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">3D visualization would appear here</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Showing orbital paths and closest approach point
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Position Data (Primary)</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">X</div>
                        <div className="font-mono text-sm">-1234.56 km</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Y</div>
                        <div className="font-mono text-sm">5678.90 km</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Z</div>
                        <div className="font-mono text-sm">3456.78 km</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Position Data (Secondary)</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">X</div>
                        <div className="font-mono text-sm">-1245.67 km</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Y</div>
                        <div className="font-mono text-sm">5690.12 km</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Z</div>
                        <div className="font-mono text-sm">3470.89 km</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recommended Actions</CardTitle>
                <CardDescription>Based on risk assessment and collision probability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collision.danger_level === "CRITICAL" && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Immediate Action Required</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Contact satellite operators immediately to coordinate avoidance maneuvers. Prepare for
                          potential collision mitigation within the next 24 hours.
                        </p>
                      </div>
                    </div>
                  )}

                  {collision.danger_level === "HIGH" && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Monitor Closely</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Continue monitoring the situation and prepare for potential avoidance maneuvers. Schedule a
                          follow-up assessment in 6 hours.
                        </p>
                      </div>
                    </div>
                  )}

                  {(collision.danger_level === "LOW" || collision.danger_level === "MODERATE") && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                      <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Routine Monitoring</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Continue routine monitoring. No immediate action required. Update risk assessment if
                          parameters change.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Documentation</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Document all observations and actions taken. Update the collision avoidance log with the latest
                        information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Data
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <Button variant="default" size="sm" className="sm:ml-auto" onClick={() => setOpen(false)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Full View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
