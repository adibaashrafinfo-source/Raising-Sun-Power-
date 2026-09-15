import { useEffect } from "react"

const SITE_NAME = "Rising Sun Power BD"

export function useSeo({
  title,
  description,
  keywords,
  noIndex,
}: {
  title: string
  description?: string
  keywords?: string[]
  noIndex?: boolean
}) {
  const keywordList = keywords?.join(", ")

  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME

    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement("meta")
        tag.setAttribute("name", "description")
        document.head.appendChild(tag)
      }
      tag.setAttribute("content", description)
    }

    if (keywordList) {
      let tag = document.querySelector('meta[name="keywords"]')
      if (!tag) {
        tag = document.createElement("meta")
        tag.setAttribute("name", "keywords")
        document.head.appendChild(tag)
      }
      tag.setAttribute("content", keywordList)
    }

    let robots = document.querySelector('meta[name="robots"]')
    if (noIndex) {
      if (!robots) {
        robots = document.createElement("meta")
        robots.setAttribute("name", "robots")
        document.head.appendChild(robots)
      }
      robots.setAttribute("content", "noindex, nofollow")
    } else if (robots) {
      robots.remove()
    }
  }, [title, description, keywordList, noIndex])
}
