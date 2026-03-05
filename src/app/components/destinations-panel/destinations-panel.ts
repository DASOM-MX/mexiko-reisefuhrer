import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';

interface Destination {
  id: number;
  title: string;
  description: string;
  mainImage: string;
  images: string[];
}

@Component({
  selector: 'app-destinations-panel',
  imports: [CommonModule, CarouselModule],
  templateUrl: './destinations-panel.html',
  styleUrl: './destinations-panel.scss',
})
export class DestinationsPanel {
  destinations: Destination[] = [
    {
      id: 1,
      title: 'Teotihuacán',
      description:
        'Die geheimnisvolle Stadt der Götter mit ihren beeindruckenden Pyramiden der Sonne und des Mondes. Ein UNESCO-Weltkulturerbe und eines der bedeutendsten präkolumbischen Zentren Mesoamerikas.',
      mainImage:
        'https://www.fundacionunam.org.mx/wp-content/uploads/2024/09/abreTEOTIHUACAN_1.jpg',
      images: [
        'https://mathkind.org/wp-content/uploads/2023/12/Teotihuacan-GMS-Pyramid-of-the-Serpent.png',
        'https://www.civitatis.com/f/pois/ChIJ0waKgufr0YUR1BNeHM53TGU.jpg',
        'https://www.elimparcial.com/resizer/v2/JC2XFQIIW5EI7FQPSY3GLAZGBA.jpeg?auth=538365076c14114d796fedab3c341f55f21916ca07ed3f85fe00ea8d0fa529f6&smart=true&width=1200&height=800&quality=70',
      ],
    },
    {
      id: 2,
      title: 'Mexico City Marvels',
      description:
        'Eine pulsierende Metropole voller Kontraste – von historischen Kolonialbauten bis zu modernen Museen. Entdecken Sie das Herz Mexikos mit seiner reichen Kultur, Kunst und kulinarischen Vielfalt.',
      mainImage:
        'https://image-tc.galaxy.tf/wijpeg-erd4s3e5ns9yjx8uvtc5zxb3s/museo-soumaya-1-orig_standard.jpg?crop=59%2C0%2C933%2C700',
      images: [
        'https://ofallthespaces.com/wp-content/uploads/2024/02/cdmx_soumaya-museum_8.jpg?w=2040',
        'https://www.mexicodesconocido.com.mx/wp-content/uploads/2024/07/paseo-de-la-reforma-victor-armas-scaled.jpg',
        'https://lh5.googleusercontent.com/proxy/HhTWYED9Df8e0uUiwDtXAriQeMZZVUj2Y7q0vkAJC9HEOI4NjJB4-e2s-UR6SLktlbmV5ZUrxBZ8_cm782zpnmxnnHmsYinHzl0NXBYRqdoxrLoOZHNHLePUzqHA6LeoZs-ttnAe9-yFPnNQNjCGD29OdTNIlrJH3Vo',
      ],
    },
    {
      id: 3,
      title: 'Basilica of Guadalupe',
      description:
        'Die wichtigste katholische Wallfahrtsstätte Lateinamerikas und eines der meistbesuchten katholischen Heiligtümer der Welt. Ein Ort der Spiritualität und beeindruckenden Architektur.',
      mainImage:
        'https://localguides.mx/wp-content/uploads/2025/04/basilica-de-guadalupe-7-2-1.webp',
      images: [
        'https://media.istockphoto.com/id/176879077/es/foto/maria-de-guadalupe-i.jpg?s=612x612&w=0&k=20&c=zfL-MUgJTFmDPgl96IODrpnJhpxG96obgwulPbysYeU=',
        'https://magicaltowns.mx/wp-content/uploads/2021/03/BASILICA-GPE-INTERIOR-MD.jpg',
        'https://dynamic-media.tacdn.com/media/photo-o/30/49/f4/5d/caption.jpg?w=700&h=500&s=1',
      ],
    },
  ];

  navigateToForm = output();

  handleNavigateToForm() {
    this.navigateToForm.emit();  
  }
}
