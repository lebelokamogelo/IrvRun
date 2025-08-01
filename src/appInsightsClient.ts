"use strict"
import * as appInsights from "applicationinsights"
import * as vscode from "vscode"

export class AppInsightsClient {
  private _client: appInsights.TelemetryClient | null = null
  private _enableAppInsights: boolean

  constructor() {
    const config = vscode.workspace.getConfiguration("code-runner")
    this._enableAppInsights = config.get<boolean>("enableAppInsights") ?? true

    if (this._enableAppInsights) {
      appInsights.setup("a25ddf11-20fc-45c6-96ae-524f47754f28").start()
      this._client = appInsights.defaultClient
    }
  }

  public sendEvent(
    eventName: string,
    properties?: { [key: string]: string }
  ): void {
    if (this._enableAppInsights && this._client) {
      this._client.trackEvent({
        name: eventName === "" ? "bat" : eventName,
        properties,
      })
    }
  }
}
