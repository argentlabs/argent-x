/**
 * Window types used in this service
 * - 'popup' refers to the normal extension window opened by user clicking extension icon
 * - 'tab' refers to the extension in a browser tab
 * - 'floating window' refers to the extension in a floating window opened programatically with type 'popup'
 */

export interface IUIService {
  /**
   * id that ths service is using for messaging
   */
  readonly connectId: string

  /**
   * The equivalent of setting or unsetting `default_popup` in the manifest
   */
  setDefaultPopup(popup?: string): Promise<void>

  /**
   * Unsets popup so that extension icon click event can be captured
   */
  unsetDefaultPopup(): Promise<void>

  /**
   * The equivalent of setting or unsetting side panel `default_path` in the manifest
   */
  setDefaultSidePanel(path?: string): Promise<void>

  /**
   * Unsets side panel so that side panel click event can be captured
   */
  unsetDefaultSidePanel(): Promise<void>

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

  /**
   * Get floating window
   * @returns floating window if it exists
   */
  getFloatingWindow(): Promise<chrome.windows.Window | undefined>

  /**
   * Determine if there is an existing floating window
   * @returns true if it exists
   */
  hasFloatingWindow(): Promise<boolean>

  /**
   * Focus floating window if it exists
   */
  focusFloatingWindow(): Promise<void>

  /**
   * Close floating window if it exists
   */
  closeFloatingWindow(): Promise<void>
}
