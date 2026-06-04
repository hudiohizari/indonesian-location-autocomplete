/*
 * Created by Hudio Hizari
 * https://hizari.my.id/
 * https://github.com/hudiohizari/
 * hhizari@gmail.com
 */

import SwiftUI

/// Reusable card container for each showcase section
struct ShowcaseCard<Content: View>: View {
    let title: String
    let backgroundColor: Color
    let titleColor: Color
    let content: () -> Content

    init(
        title: String,
        backgroundColor: Color = Color(uiColor: .secondarySystemGroupedBackground),
        titleColor: Color = .primary,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.title = title
        self.backgroundColor = backgroundColor
        self.titleColor = titleColor
        self.content = content
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(titleColor)

            content()
        }
        .padding(16)
        .background(backgroundColor)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 2)
        .padding(.horizontal)
    }
}
