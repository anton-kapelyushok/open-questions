import { Injectable } from '@angular/core';
import { Configuration, Exam, UnnormalizedExam } from '../data/exam';
import { EXAMS } from './mock-exams';
import { TaskService } from './task.service';
import { TeacherService } from './teacher.service';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Data, PagingState } from '../paging/paging';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


const unnormalizedConfigurationFromServerUnnormalizedExamData = (serverEntity: any): UnnormalizedExam => {
  return {
    globalExamId: serverEntity.globalExamId,
    configuration: {
      name: serverEntity.name,
      tasks: serverEntity.tasks,
      examContainer: serverEntity.examContainer,
    },
  };
};

const configurationWithTeacherId = (configuration: Configuration, teacherId: string): any => {
  return { ...configuration, ...{ teacherId: teacherId } };
};

@Injectable()
export class ExamService {
  lastId = 100;
  exams = EXAMS;
  constructor(private taskService: TaskService,
              private teacherService: TeacherService,
              private http: Http) { }
  createConfiguration(configuration: Configuration): Promise<Exam> {
    return this.http.post(
      '/api/createExam',
      configurationWithTeacherId(configuration, this.teacherService.getTeacherId())
    ).toPromise()
      .then(res => res.json());
  }
  getExam(id): Promise<UnnormalizedExam> {
    return this.http.get(`/api/getNormalizedExam/${id}`).toPromise()
      .then(res => res.json())
      .then(json => {
        console.log(json);
        const unnormalizedExam = unnormalizedConfigurationFromServerUnnormalizedExamData(json);
        console.log(unnormalizedExam);
        return unnormalizedExam;
      });
  }
  getExams(): Promise<Exam[]> {
    return this.http.get('/api/exams').toPromise()
      .then(res => res.json()._embedded.exams);
  }

  fetchExams(pagingState: PagingState): Observable<Data<Exam>> {
    return this.http.get('/api/exams', {
      params: {
        page: pagingState.currentPage() - 1,
        size: pagingState.itemsPerPage(),
      },
    }).map(response => response.json())
      .map((json: any): Data<Exam> => {
        return {
          totalCount: json.page.totalElements,
          items: json._embedded.exams,
        };
      });
  }

}
