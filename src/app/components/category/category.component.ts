import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.css"],
  standalone: true,
  imports: [CommonModule],
})
export class CategoryComponent {
  @Input() categoryUsage: { [key: string]: number } = {
    Animals: 0,
    Food: 0,
    Places: 0,
  };
  @Input() CATEGORY_LIMIT: number = 3;

  @Output() categorySelected = new EventEmitter<string>();
  categories = ["Animals", "Food", "Places"];

  selectCategory(category: string): void {
    if (this.categoryUsage[category] >= this.CATEGORY_LIMIT) {
      alert(
        `You've used all "${this.CATEGORY_LIMIT}" words in the "${category}" category.`
      );
      return;
    }
    this.categoryUsage[category]++;
    this.categorySelected.emit(category);
  }
}
