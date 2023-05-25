export interface IUIService {
  /**
   * The equivalent of setting or unsetting `default_popup` in the manifest
   */
  setDefaultPopup(popup?: string): Promise<void>

  /**
   * Unsets popup so that extension icon click event can be captured
   */
  unsetDefaultPopup(): Promise<void>

  /**
   * Get popup
   * @returns popup if it exists
   */
  getPopup(): Window

  /**
   * Determine if there is an existing popup
   * @returns true if it exists
   */
  hasPopup(): boolean

  /**
   * Close popup if it exists
   */
  closePopup(): void

  /**
   * Creates a tab with the provided path
   * @returns tab
   */
  createTab(path?: string): Promise<chrome.tabs.Tab>

  /**
   * Determine if there is an existing tab
   * @returns true if it exists
   */
  hasTab(): Promise<boolean>

  /**
   * Get existing tab
   * @returns tab if it exists
   */
  getTab(): Promise<chrome.tabs.Tab>

  /**
   * Focus existing tab (and window) if it exists
   */
  focusTab(): Promise<void>
}
