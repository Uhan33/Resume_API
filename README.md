select AUTHOR_ID, AUTHOR_NAME, CATEGORY, PRICE*AVG(SALES) AS TOTAL_SALES
from BOOK b, AUTHOR a, BOOK_SALES bs
where bs.SALES_DATE <  '2022-02-01'
group by a.AUTHOR_ID, b.CATEGORY
order by a.AUTHOR_ID, b.CATEGORY

환경변수
.env 파일에 어떤 환경변수가 추가되어야 하는지 작성합니다.

key=value 형태에서 key만 나열합니다. value는 비밀!

DATABASE_URL

DATABASE_HOST

DATABASE_PORT

DATABASE_NAME

DATABASE_USERNAME

DATABASE_PASSWORD

ACCESS_TOKEN_SECRET_KEY

REFRESH_TOKEN_SECRET_KEY

API 명세서 URL
http://43.203.197.102:3001/api-docs


ERD URL
https://www.erdcloud.com/d/62ec94MyZgb9aePoi


더 고민해 보기
암호화 방식

비밀번호를 DB에 저장할 때 Hash를 이용했는데, Hash는 단방향 암호화와 양방향 암호화 중 어떤 암호화 방식에 해당할까요?
비밀번호를 그냥 저장하지 않고 Hash 한 값을 저장 했을 때의 좋은 점은 무엇인가요?
단방향 암호화에 해당한다. Hash 값을 저장하면, 비밀번호를 의도치않은 누군가에 의해 조회당하였을 때, 사용자가 실제로 사용하는 비밀번호가 아닌 hash값만 조회되어 실제 비밀번호를 알 수 없기 때문이다.

인증 방식

JWT(Json Web Token)을 이용해 인증 기능을 했는데, 만약 Access Token이 노출되었을 경우 발생할 수 있는 문제점은 무엇일까요?
해당 문제점을 보완하기 위한 방법으로는 어떤 것이 있을까요?
Access Token이 노출되면 실제로는 원래 유저가 아니지만 해당 유저의 권한을 가지고 할 수 있는 모든 것을 마음대로 사용할 수 있어 위험하다. 보안하기 위해서는 Access Token의 유효기간을 짧게 설정하여 사용자를 자주 인증해주거나, Refresh Token을 만들어 DB에 저장하고, Access Token이 만료되면 Refresh Token을 통해 새로운 Access Token을 생성해주는 방법이 있겠다.

인증과 인가

인증과 인가가 무엇인지 각각 설명해 주세요.
과제에서 구현한 Middleware는 인증에 해당하나요? 인가에 해당하나요? 그 이유도 알려주세요.
인증은 사용자의 신원을 검증하는 것이고, 인가는 인증된 사용자가 어떠한 자원에 접근할 수 있는지 확인하는 것이다. 과제에서 구현한 Middleware는 사용자의 쿠키를 검증하는 단계이기 때문에 인증에 해당한다.

Http Status Code

과제를 진행하면서 사용한 Http Status Code를 모두 나열하고, 각각이 의미하는 것과 어떤 상황에 사용했는지 작성해 주세요.
200 조회 성공 201 생성 성공 400 요청에 문제가 있음 (비밀번호 글자 수 등) 401 승인된 사용자가 아닐 경우 404 조회 실패 409 요청 값 중복 500 서버 에러

리팩토링

MySQL, Prisma로 개발했는데 MySQL을 MongoDB로 혹은 Prisma 를 TypeORM 로 변경하게 된다면 많은 코드 변경이 필요할까요? 주로 어떤 코드에서 변경이 필요한가요?
만약 이렇게 DB를 변경하는 경우가 또 발생했을 때, 코드 변경을 보다 쉽게 하려면 어떻게 코드를 작성하면 좋을 지 생각나는 방식이 있나요? 있다면 작성해 주세요.
코드 변경이 많이 필요하진 않다고 생각한다. DB를 변경하였을 경우는 prisma의 속성값만 변경해주면 될 것이고, ORM이 변경이된다면 ORM에 맞는 설정을 통해 기존에 사용하던 DB를 연결만 시켜주면 될 것이다. prisma같은 orm을 사용하였으니 DB가 변경되더라도 DB 테이블에 접근하는 코드는 변경할 필요가 없을 것이다. 코드 변경을 최대한 줄이려면 orm의 속성값을 최대한 변수화시켜 변수만 변경해주는 방식으로 하면 좋을 것 같다.

API 명세서

notion 혹은 엑셀에 작성하여 전달하는 것 보다 swagger 를 통해 전달하면 장점은 무엇일까요?
개발은 혼자 하는 것이 아니기에 자신이 만든 api를 다른 개발자가 확인할 수 있도록 명세서를 작성해주어야 한다. swagger는 본인이 직접 작성하는 api 명세서보다 훨씬 간편하고 전달력이 높다. 요청 메소드, 파라미터 등등 필요한 모든 것들을 표현할 수 있고, 결과 값을 예상하여 알려주면서, 심지어 실제 요청을 통해 결과 값을 받아볼 수도 있다. api를 사용해야하는 입장으로써 굉장히 편리하고 어떻게 요청해야 어떻게 돌아오는지 명확히 알 수 있다.
