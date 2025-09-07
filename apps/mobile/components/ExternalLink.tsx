import { Link } from "expo-router"
import { openBrowserAsync } from "expo-web-browser"
import { type ComponentProps } from "react"
import { Platform } from "react-native"

type LinkHref = ComponentProps<typeof Link>['href']
type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: LinkHref }

export function ExternalLink({ href, ...rest }: Props) {
    return (
        <Link
            target="_blank"
            {...rest}
            href={href}
            onPress={async (event) => {
                if (Platform.OS !== "web") {
                    // Prevent the default behavior of linking to the default browser on native.
                    event.preventDefault()
                    // Resolve href to a string URL (handle string hrefs and object hrefs with pathname/params).
                    let url: string
                    if (typeof href === "string") {
                        url = href
                    } else if (href && typeof href === "object" && "pathname" in href) {
                        const { pathname, params } = href as { pathname: string; params?: Record<string, string> }
                        const qs = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""
                        url = `${pathname}${qs}`
                    } else {
                        // Fallback to string conversion
                        url = String(href)
                    }
                    // Open the link in an in-app browser.
                    await openBrowserAsync(url)
                }
            }}
        />
    )
}
